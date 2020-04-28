const mods = require('./mods');
const { Readable } = require('stream');
const unzipper = require('unzipper');
const javaDeserialization = require('java-deserialization');
const request = require('request');

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

/**
 * 
 * @prop {number} score_id - The score ID of the replay.
 * @prop {Buffer} odr - The odr file of the replay.
 * @prop {Object} data - An object containing the results of the analyzer.
 * @prop {function:Promise<ReplayAnalyzer>} analyze - Asynchronously analyzes a replay.
 */
class ReplayAnalyzer {
    /**
     * @param {number} score_id The score ID of the score to analyze.
     */
    constructor(score_id) {
        /**
         * @type {number}
         * @description The score ID of the replay.
         */
        this.score_id = score_id;
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
         * @type {Object}
         * @description An object containing the results of the analyzer.
         */
        this.data = {
            /**
             * @type {number}
             * @description The version of the replay
             */
            replay_version: 0,

            /**
             * @type {string}
             * @description The folder name containing the beatmap played.
             */
            folder_name: '',

            /**
             * @type {string}
             * @description The file name of the beatmap played.
             */
            file_name: '',

            /**
             * @type {string}
             * @description MD5 hash of the replay.
             */
            hash: '',

            /**
             * @type {Date}
             * @description The date of which the play was set.
             */
            time: new Date(0),

            /**
             * @type {number}
             * @description The amount of geki and 300 katu achieved in the play. See {@link https://osu.ppy.sh/help/wiki/Score this} osu! wiki page for more information.
             */
            hit300k: 0,

            /**
             * @type {number}
             * @description The amount of 300s achieved in the play.
             */
            hit300: 0,

            /**
             * @type {number}
             * The amount of 100 katu achieved in the play. See {@link https://osu.ppy.sh/help/wiki/Score this} osu! wiki page for more information.
             */
            hit100k: 0,

            /**
             * @type {number}
             * @description The amount of 100s achieved in the play.
             */
            hit100: 0,

            /**
             * @type {number}
             * @description The amount of 50s achieved in the play.
             */
            hit50: 0,

            /**
             * @type {number}
             * @description The amount of misses achieved in the play.
             */
            hit0: 0,

            /** 
             * @type {number}
             * @description The total score achieved in the play.
             */
            score: 0,

            /**
             * @type {number}
             * @description The maximum combo achieved in the play.
             */
            max_combo: 0,

            /**
             * @type {number}
             * @description The accuracy achieved in the play.
             */
            accuracy: 0,

            /**
             * @type {number}
             * @description Whether or not the play achieved the beatmap's maximum combo (1 for `true`, 0 for `false`).
             */
            is_full_combo: 0,

            /**
             * @type {number}
             * @description The name of the player in the replay.
             */
            player_name: '',

            /** 
             * @type {string}
             * @description Enabled modifications during the play.
             */
            mods: '',

            /**
             * @type { { size: number, time: number[], x: number[], y: number[], id: number[] }[] }
             * @description The cursor movement data of the replay.
             */
            cursor_movement: [],

            /**
             * @type { { accuracy: number, tickset: number[], result: number }[] }
             * @description The hit object data of the replay.
             */
            hit_object_data: []
        }
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
                .on('complete', async () => {
                    const result = Buffer.concat(data_array);
                    const stream = new Readable();
                    stream.push(result);
                    stream.push(null);
                    stream.pipe(unzipper.Parse())
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

        this.data.replay_version = raw_object[0].version;
        this.data.folder_name = raw_object[1];
        this.data.file_name = raw_object[2];
        this.data.hash = raw_object[3];
        this.data.time = new Date(Number(raw_object[4].readBigUInt64BE(0)));
        this.data.hit300k = raw_object[4].readUInt32BE(8);
        this.data.hit300 =  raw_object[4].readInt32BE(12);
        this.data.hit100k = raw_object[4].readInt32BE(16);
        this.data.hit100 = raw_object[4].readInt32BE(20);
        this.data.hit50 = raw_object[4].readInt32BE(24);
        this.data.hit0 = raw_object[4].readInt32BE(28);
        this.data.score = raw_object[4].readInt32BE(32);
        this.data.max_combo = raw_object[4].readInt32BE(36);
        this.data.accuracy = raw_object[4].readFloatBE(40) * 100;
        this.data.is_full_combo = raw_object[4][44];
        this.data.player_name = raw_object[5];
        this.data.mods = this._convertMods(raw_object[6].elements);

        let replay_data_buffer_array = [];
        for (let i = 7; i < raw_object.length; i++) replay_data_buffer_array.push(raw_object[i]);
    
        //merge all buffer section into one for better control when parsing
        let replay_data_buffer = Buffer.concat(replay_data_buffer_array);
        let buffer_counter = 0;

        let size = replay_data_buffer.readInt32BE(buffer_counter);
        buffer_counter += INT_LENGTH;
        let move_array_collection = [];

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
            move_array_collection.push(move_array)
        }

        let replay_object_array = [];
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

            if (this.data.replay_version >= 1) {
                replay_object_data.result = replay_data_buffer.readInt8(buffer_counter);
                buffer_counter += BYTE_LENGTH
            }

            replay_object_array.push(replay_object_data)
        }

        this.data.cursor_movement = move_array_collection;
        this.data.hit_object_data = replay_object_array;
        this.is3Finger = this.data.cursor_movement[3].size / this.data.cursor_movement[1].size > 0.01
    }

    /**
     * Converts replay mods to regular mod string.
     *
     * @param {string[]} [replay_mods] The mod string to convert.
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
        while (replay_mods.length) {
            for (let property in replay_mods_bitmask) {
                if (!replay_mods_bitmask.hasOwnProperty(property)) continue;
                if (!replay_mods[0].includes(property)) continue;
                modbits |= replay_mods_bitmask[property];
                break
            }
            replay_mods.shift()
        }

        return mods.modbits_to_string(modbits)
    }
}

module.exports = ReplayAnalyzer;
