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

/**
 * A replay analyzer that analyzes a replay from osu!droid with given score ID. This is mainly used to detect whether or not a play is considered using >=3 fingers abuse.
 * 
 * Once analyzed, the result can be accessed via the `data` property.
 */
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
         * @description The original odr file of the replay.
         */
        this.original_odr = undefined;

        /**
         * @type {Buffer|undefined}
         * @description The fixed odr file of the replay. This is used to parse the replay.
         */
        this.fixed_odr = undefined;

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
        this.fixed_odr = await this._decompress().catch(console.error);
        if (!this.fixed_odr) {
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
                    if (result.toString("utf8").includes("404 Not Found")) return resolve(null);
                    this.original_odr = result;
                    const stream = new Readable();
                    stream.push(result);
                    stream.push(null);
                    stream.pipe(Parse())
                        .on('entry', async entry => {
                            const fileName = entry.path;
                            if (fileName === 'data') {
                                resolve(await entry.buffer());
                            } else {
                                entry.autodrain();
                            }
                        })
                        .on('error', e => {
                            setTimeout(() => reject(e), 2000);
                        });
                })
                .on('error', e => {
                    reject(e);
                });
        });
    }

    /**
     * Parses a replay after being downloaded and converted to a buffer.
     * @private
     */
    _parseReplay() {
        // javaDeserialization can only somewhat parse some string field
        // the rest will be a buffer that we need to manually parse
        const rawObject = javaDeserialization.parse(this.fixed_odr);

        const resultObject = rawObject[0].version >= 3 ? {
            replay_version: rawObject[0].version,
            folder_name: rawObject[1],
            file_name: rawObject[2],
            hash: rawObject[3],
            time: Number(rawObject[4].readBigUInt64BE(0)),
            hit300k: rawObject[4].readInt32BE(8),
            hit300: rawObject[4].readInt32BE(12),
            hit100k: rawObject[4].readInt32BE(16),
            hit100: rawObject[4].readInt32BE(20),
            hit50: rawObject[4].readInt32BE(24),
            hit0: rawObject[4].readInt32BE(28),
            score: rawObject[4].readInt32BE(32),
            max_combo: rawObject[4].readInt32BE(36),
            accuracy: rawObject[4].readFloatBE(40),
            is_full_combo: rawObject[4][44],
            player_name: rawObject[5],
            raw_mods: rawObject[6].elements,
            droid_mods: this._convertDroidMods(rawObject[6].elements),
            converted_mods: this._convertMods(rawObject[6].elements),
            cursor_movement: [],
            hit_object_data: []
        } : {
            replay_version: rawObject[0].version,
            folder_name: rawObject[1],
            file_name: rawObject[2],
            hash: rawObject[3],
            cursor_movement: [],
            hit_object_data: []
        };

        const replayDataBufferArray = [];
        for (let i = resultObject.replay_version >= 3 ? 7 : 4; i < rawObject.length; i++) replayDataBufferArray.push(rawObject[i]);

        //merge all cursor movement and hit object data section into one for better control when parsing
        const replayDataBuffer = Buffer.concat(replayDataBufferArray);
        let bufferCounter = 0;

        const size = replayDataBuffer.readInt32BE(bufferCounter);
        bufferCounter += INT_LENGTH;

        //parse movement data
        for (let x = 0; x < size; x++) {
            const moveSize = replayDataBuffer.readInt32BE(bufferCounter);
            bufferCounter += INT_LENGTH;
            const moveArray = {
                size: moveSize,
                time: [],
                x: [],
                y: [],
                id: []
            };
            for (let i = 0; i < moveSize; i++) {
                moveArray.time[i] = replayDataBuffer.readInt32BE(bufferCounter);
                bufferCounter += INT_LENGTH;
                moveArray.id[i] = moveArray.time[i] & 3;
                moveArray.time[i] >>= 2;
                if (moveArray.id[i] !== movementType.UP) {
                    moveArray.x[i] = replayDataBuffer.readInt16BE(bufferCounter);
                    bufferCounter += SHORT_LENGTH;
                    moveArray.y[i] = replayDataBuffer.readInt16BE(bufferCounter);
                    bufferCounter += SHORT_LENGTH;
                }
                else {
                    moveArray.x[i] = -1;
                    moveArray.y[i] = -1;
                }
            }
            resultObject.cursor_movement.push(new CursorData(moveArray));
        }

        const replayObjectLength = replayDataBuffer.readInt32BE(bufferCounter);
        bufferCounter += INT_LENGTH;

        //parse result data
        for (let i = 0; i < replayObjectLength; i++) {
            const replayObjectData = {
                accuracy: 0,
                tickset: [],
                result: 0
            };

            replayObjectData.accuracy = replayDataBuffer.readInt16BE(bufferCounter);
            bufferCounter += SHORT_LENGTH;
            const len = replayDataBuffer.readInt8(bufferCounter);
            bufferCounter += BYTE_LENGTH;

            if (len > 0) {
                let bytes = [];

                for (let j = 0; j < len; j++) {
                    bytes.push(replayDataBuffer.readInt8(bufferCounter));
                    bufferCounter += BYTE_LENGTH;
                }

                for (let j = 0; j < len * 8; j++) replayObjectData.tickset[j] = (bytes[len - j / 8 - 1] & 1 << (j % 8)) !== 0;
            }

            if (resultObject.replay_version >= 1) {
                replayObjectData.result = replayDataBuffer.readInt8(bufferCounter);
                bufferCounter += BYTE_LENGTH;
            }

            resultObject.hit_object_data.push(new ReplayObjectData(replayObjectData));
        }
        this.data = new ReplayData(resultObject);
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
                break;
            }
        }

        return mods.modbits_to_string(modbits);
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
        };

        let mod_string = '';
        for (const mod of replay_mods) {
            for (let property in replay_mods_constants) {
                if (!replay_mods_constants.hasOwnProperty(property)) continue;
                if (!mod.includes(property)) continue;
                mod_string += replay_mods_constants[property];
                break;
            }
        } 

        return mod_string;
    }
}

module.exports = ReplayAnalyzer;
