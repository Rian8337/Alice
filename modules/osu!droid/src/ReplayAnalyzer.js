const mods = require('./mods');
const {Readable}  = require('stream');
const {Parse} = require('unzipper');
const javaDeserialization = require('java-deserialization');
const request = require('request');
const ReplayData = require('./ReplayData');
const CursorData = require('./CursorData');
const ReplayObjectData = require('./ReplayObjectData');

// (internal)
// constants for replay analyzer
const CURSOR_ID_DOWN = 0;
const CURSOR_ID_MOVE = 1;
const CURSOR_ID_UP = 2;

const RESULT_0 = 1;
const RESULT_50 = 2;
const RESULT_100 = 3;
const RESULT_300 = 4;

const BYTE_LENGTH = 1;
const SHORT_LENGTH = 2;
const INT_LENGTH = 4;
const LONG_LENGTH = 8;

class ReplayAnalyzer {
    /**
     * @param {Object} values An object containing the parameters.
     * @param {number} values.score_id The score ID of the score to analyze.
     */
    constructor(values = {}) {
        /**
         * @type {number}
         * @description The score ID of the replay.
         */
        this.score_id = values.score_id;
        if (!this.score_id) {
            throw new TypeError("Please specify a score ID")
        }
        /**
         * @type {Buffer|undefined}
         * @description The odr file of the replay.
         */
        this.odr = undefined;

        /**
         * @type {boolean|undefined}
         * @description Whether or not the play is considered using >=3 finger abuse.
         */
        this.is3Finger = undefined;

        /**
         * @type {ReplayData|null}
         * @description The results of the analyzer. `null` when initialized.
         */
        this.data = null;
    }

    /**
     * Asynchronously analyzes a replay.
     *
     * @returns {Promise<ReplayAnalyzer>} The current instance containing analyzed replay data in the `data` property.
     */
    async analyze() {
        this.odr = await this._decompress().catch(console.error);
        if (!this.odr) {
            return this
        }
        this._parseReplay();
        return this
    }

    /**
     * Downloads and decompresses a replay.
     * 
     * The decompressed replay is in a form of Java object. This will be converted to a buffer and deserialized to read data from the replay.
     *
     * @returns {Promise<Buffer>} A buffer of the replay file.
     * @private
     */
    _decompress() {
        return new Promise((resolve, reject) => {
            const data_array = [];
            const url = `http://ops.dgsrz.com/api/upload/${this.score_id}.odr`;
            request(url, {timeout: 10000})
                .on('data', chunk => {
                    data_array.push(Buffer.from(chunk))
                })
                .on('complete', () => {
                    const result = Buffer.concat(data_array);
                    const stream = new Readable();
                    stream.push(result);
                    stream.push(null);
                    stream.pipe(Parse())
                        .on('entry', async entry => {
                            const fileName = entry.path;
                            if (fileName === 'data') {
                                resolve(await entry.buffer())
                            } else {
                                entry.autodrain()
                            }
                        })
                        .on('error', e => {
                            setTimeout(() => reject(e), 2000)
                        })
                })
                .on('error', e => {
                    reject(e)
                })
        })
    }

    /**
     * Parses a replay after being downloaded and converted to a buffer.
     * @private
     */
    _parseReplay() {
        // javaDeserialization can only somewhat parse some string field
        // the rest will be a buffer that we need to manually parse
        const raw_object = javaDeserialization.parse(this.odr);

        const result_object = {
            replay_version: raw_object[0].version,
            folder_name: raw_object[1],
            file_name: raw_object[2],
            hash: raw_object[3],
            time: Number(raw_object[4].readBigUInt64BE(0)),
            hit300k: raw_object[4].readInt32BE(8),
            hit300: raw_object[4].readInt32BE(12),
            hit100k: raw_object[4].readInt32BE(16),
            hit100: raw_object[4].readInt32BE(20),
            hit50: raw_object[4].readInt32BE(24),
            hit0: raw_object[4].readInt32BE(28),
            score: raw_object[4].readInt32BE(32),
            max_combo: raw_object[4].readInt32BE(36),
            accuracy: raw_object[4].readFloatBE(40),
            is_full_combo: raw_object[4][44],
            player_name: raw_object[5],
            raw_mods: raw_object[6].elements,
            droid_mods: this._convertDroidMods(raw_object[6].elements),
            converted_mods: this._convertMods(raw_object[6].elements),
            cursor_movement: [],
            hit_object_data: []
        };

        let replay_data_buffer_array = [];
        for (let i = 7; i < raw_object.length; i++) replay_data_buffer_array.push(raw_object[i]);
    
        //merge all buffer section into one for better control when parsing
        let replay_data_buffer = Buffer.concat(replay_data_buffer_array);
        let buffer_counter = 0;

        let size = replay_data_buffer.readInt32BE(buffer_counter);
        buffer_counter += INT_LENGTH;

        //parse movement data
        for (let x = 0; x < size; x++) {
            let move_size = replay_data_buffer.readInt32BE(buffer_counter);
            buffer_counter += INT_LENGTH;
            let move_array = {
                size: move_size,
                time: [],
                x: [],
                y: [],
                id: []
            };
            for (let i = 0; i < move_size; i++) {
                move_array.time[i] = replay_data_buffer.readInt32BE(buffer_counter);
                buffer_counter += INT_LENGTH;
                move_array.id[i] = move_array.time[i] & 3;
                move_array.time[i] >>= 2;
                if (move_array.id[i] !== CURSOR_ID_UP) {
                    move_array.x[i] = replay_data_buffer.readInt16BE(buffer_counter);
                    buffer_counter += SHORT_LENGTH;
                    move_array.y[i] = replay_data_buffer.readInt16BE(buffer_counter);
                    buffer_counter += SHORT_LENGTH
                }
                else {
                    move_array.x[i] = -1;
                    move_array.y[i] = -1
                }
            }
            result_object.cursor_movement.push(new CursorData(move_array))
        }

        let replay_object_length = replay_data_buffer.readInt32BE(buffer_counter);
        buffer_counter += INT_LENGTH;

        //parse result data
        for (let i = 0; i < replay_object_length; i++) {
            let replay_object_data = {
                accuracy: 0,
                tickset: [],
                result: 0
            };

            replay_object_data.accuracy = replay_data_buffer.readInt16BE(buffer_counter);
            buffer_counter += SHORT_LENGTH;
            let len = replay_data_buffer.readInt8(buffer_counter);
            buffer_counter += BYTE_LENGTH;

            if (len > 0) {
                let bytes = [];

                for (let j = 0; j < len; j++) {
                    bytes.push(replay_data_buffer.readInt8(buffer_counter));
                    buffer_counter += BYTE_LENGTH
                }

                for (let j = 0; j < len * 8; j++) replay_object_data.tickset[j] = (bytes[len - j / 8 - 1] & 1 << (j % 8)) !== 0
            }

            if (result_object.replay_version >= 1) {
                replay_object_data.result = replay_data_buffer.readInt8(buffer_counter);
                buffer_counter += BYTE_LENGTH
            }

            result_object.hit_object_data.push(new ReplayObjectData(replay_object_data))
        }

        this.is3Finger = result_object.cursor_movement[3].size / result_object.cursor_movement[1].size > 0.01;
        this.data = new ReplayData(result_object)
    }

    /**
     * Converts replay mods to regular mod string.
     *
     * @param {string[]} replay_mods The mod string to convert.
     * @returns {string} The converted mods.
     * @private
     */
    _convertMods(replay_mods) {
        const replay_mods_bitmask = {
            "NOFAIL": 1<<0,
            "EASY": 1<<1,
            "HIDDEN": 1<<3,
            "HARDROCK": 1<<4,
            "DOUBLETIME": 1<<6,
            "HALFTIME": 1<<8,
            "NIGHTCORE": 1<<9
        };

        let modbits = 0;
        for (const mod of replay_mods) {
            for (let property in replay_mods_bitmask) {
                if (!replay_mods_bitmask.hasOwnProperty(property)) continue;
                if (!mod.includes(property)) continue;
                modbits |= replay_mods_bitmask[property];
                break
            }
        }

        return mods.modbits_to_string(modbits)
    }

    /**
     * Converts replay mods to droid mod string.
     *
     * @param {string[]} replay_mods The mod string to convert.
     * @returns {string} The converted mods.
     * @private
     */
    _convertDroidMods(replay_mods) {
        const replay_mods_constants = {
            "NOFAIL": "n",
            "EASY": "e",
            "HIDDEN": "h",
            "HARDROCK": "r",
            "DOUBLETIME": "d",
            "HALFTIME": "t",
            "NIGHTCORE": "c"
        }

        let mod_string = '';
        for (const mod of replay_mods) {
            for (let property in replay_mods_constants) {
                if (!replay_mods_constants.hasOwnProperty(property)) continue;
                if (!mod.includes(property)) continue;
                mod_string += replay_mods_constants[property];
                break
            }
        } 

        return mod_string
    }
}

module.exports = ReplayAnalyzer;