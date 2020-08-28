const mods = require('./mods');
const modes = require('./constants/modes');
const hitResult = require('./constants/hitResult');
const movementType = require('./constants/movementType');
const {Readable} = require('stream');
const {Parse} = require('unzipper');
const javaDeserialization = require('java-deserialization');
const request = require('request');
const MapStats = require('./MapStats');
const Beatmap = require('./Beatmap');
const StandardDiff = require('./StandardDiff');
const ReplayData = require('./ReplayData');
const CursorData = require('./CursorData');
const ReplayObjectData = require('./ReplayObjectData');

// (internal)
// constants for replay analyzer
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
     * @param {Beatmap|StandardDiff} [values.map] The beatmap of the replay. This is necessary for replay analyzing or if old replay version is found (replay v1).
     */
    constructor(values = {}) {
        /**
         * @type {number}
         * @description The score ID of the replay.
         */
        this.score_id = values.score_id;
        if (!this.score_id) {
            throw new TypeError("Please specify a score ID");
        }
        
        /**
         * @type {Buffer|undefined}
         * @description The original odr file of the replay.
         */
        this.original_odr = undefined;

        /**
         * @type {Buffer|undefined}
         * @description The fixed odr file of the replay.
         */
        this.fixed_odr = undefined;

        /**
         * @type {boolean|undefined}
         * @description Whether or not the play is considered using >=3 finger abuse.
         */
        this.is3Finger = undefined;

        /**
         * @type {Beatmap|StandardDiff|undefined}
         * @description The beatmap that is being analyzed in `Beatmap` or `StandardDiff` instance. `StandardDiff` is required for penalty analyzing.
         */
        this.map = values.map ? values.map : undefined;

        /**
         * @type {ReplayData|null}
         * @description The results of the analyzer. `null` when initialized.
         */
        this.data = null;

        /** 
         * @type {number}
         * @description Penalty value used to penaltize dpp for 3 finger abuse.
         */
        this.penalty = 1;
    }

    /**
     * Asynchronously analyzes a replay.
     *
     * @returns {Promise<ReplayAnalyzer>} The current instance containing analyzed replay data in the `data` property.
     */
    async analyze() {
        this.fixed_odr = await this._decompress().catch(console.error);
        if (!this.fixed_odr) {
            return this;
        }
        this._parseReplay();
        // this._analyzeReplay();
        return this;
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
                    data_array.push(Buffer.from(chunk));
                })
                .on('complete', () => {
                    const result = Buffer.concat(data_array);
                    if (result.toString("utf8").includes("404 Not Found")) {
                        console.log("Replay not found");
                        return resolve(null);
                    }
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

        // parse hit results in old replay version
        if (resultObject.replay_version < 3 && (this.map instanceof StandardDiff || this.map instanceof Beatmap)) {
            let hit300 = 0;
            let hit300k = 0;
            let hit100 = 0;
            let hit100k = 0;
            let hit50 = 0;
            let hit0 = 0;
            let grantsGekiOrKatu = true;

            const objects = this.map instanceof StandardDiff ? this.map.map.objects : this.map.objects;

            for (let i = 0; i < resultObject.hit_object_data.length; ++i) {
                const hitObjectData = resultObject.hit_object_data[i];
                const isNextNewCombo = i + 1 !== objects.length ? objects[i + 1].isNewCombo : true;

                switch (hitObjectData.result) {
                    case hitResult.RESULT_0:
                        ++hit0;
                        grantsGekiOrKatu = false;
                        break;
                    case hitResult.RESULT_50:
                        grantsGekiOrKatu = false;
                        ++hit50;
                        break;
                    case hitResult.RESULT_100:
                        ++hit100;
                        if (grantsGekiOrKatu && isNextNewCombo) {
                            ++hit100k;
                        }
                        break;
                    case hitResult.RESULT_300:
                        ++hit300;
                        if (grantsGekiOrKatu && isNextNewCombo) {
                            ++hit300k;
                        }
                        break;
                }

                if (isNextNewCombo) {
                    grantsGekiOrKatu = true;
                }
            }

            resultObject.hit300 = hit300;
            resultObject.hit300k = hit300k;
            resultObject.hit100 = hit100;
            resultObject.hit100k = hit100k;
            resultObject.hit50 = hit50;
            resultObject.hit0 = hit0;
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
                if (!replay_mods_bitmask.hasOwnProperty(property)) {
                    continue;
                }
                if (!mod.includes(property)) {
                    continue;
                }
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
                if (!replay_mods_constants.hasOwnProperty(property)) {
                    continue;
                }
                if (!mod.includes(property)) {
                    continue;
                }
                mod_string += replay_mods_constants[property];
                break;
            }
        }

        return mod_string;
    }

    /**
     * Analyzes a replay if 3 finger play is found.
     * 
     * @private
     */
    _analyzeReplay() {
        if (!(this.map instanceof StandardDiff)) {
            return;
        }
        // strain threshold to start detecting for 3 finger section
        const STRAIN_THRESHOLD = 200;

        const THREE_FINGER_THRESHOLD = 0.01;

        // time intervals to be used to filter cursor instances
        const od = new MapStats(this.map.map).calculate({mode: modes.osu, mods: this.data.converted_mods}).od;
        let firstTime = Number.NaN;
        let lastTime = Number.NaN;
        
        // total strains during a detected section
        let cumulativeStrain = 0;

        // total hit accuracy offset during a detected section
        let cumulativeAcc = 0;

        // first index of object with strain above strain threshold
        let strainIndexStart = 0;

        // filter cursor instances throughout break sections
        const breakPoints = this.map.map.breaks;
        const cursorInstances = this.data.cursor_movement;
        const newCursorInstances = [];
        let totalCursorAmount = 0;
        let zeroCursorAmount = 0;
        for (let i = 0; i < cursorInstances.length; ++i) {
            const cursorInstance = cursorInstances[i];
            if (zeroCursorAmount === 2) {
                break;
            }

            const newCursorData = {
                size: 0,
                time: [],
                x: [],
                y: [],
                id: []
            };

            for (let j = 0; j < cursorInstance.size; ++j) {
                if (cursorInstance.id[j] !== movementType.DOWN) {
                    continue;
                }

                const time = cursorInstance.time[j];
                let inBreakPoint = false;
                for (const breakPoint of breakPoints) {
                    if (time >= breakPoint.startTime && time <= breakPoint.endTime) {
                        inBreakPoint = true;
                        break;
                    }
                }

                if (inBreakPoint) {
                    continue;
                }

                ++newCursorData.size;
                newCursorData.time.push(time);
                newCursorData.x.push(cursorInstance.x[j]);
                newCursorData.y.push(cursorInstance.y[j]);
                newCursorData.id.push(cursorInstance.id[j]);
            }
            if (newCursorData.size === 0) {
                ++zeroCursorAmount;
            }
            totalCursorAmount += newCursorData.size;
            newCursorInstances.push(new CursorData(newCursorData));
        }

        // if there are more than 2 cursor instances with 0 size,
        // it is safe to assume that the play is not 3-fingered
        //
        // therefore we can skip analysis 
        if (zeroCursorAmount >= 2) {
            this.is3Finger = false;
            this.penalty = 1;
            return;
        }

        const objects = this.map.objects;

        // try to prevent accidental taps
        for (let i = 0; i < newCursorInstances.length; ++i) {
            const cursorInstance = newCursorInstances[i];
            // use an estimation for accidental tap threshold
            if (cursorInstance.size > 0 && cursorInstance.size <= Math.ceil(objects.length / 250) && cursorInstance.size / totalCursorAmount < THREE_FINGER_THRESHOLD) {
                ++zeroCursorAmount;
                for (const property in cursorInstance) {
                    if (Array.isArray(cursorInstance[property])) {
                        cursorInstance[property].length = 0;
                    } else {
                        cursorInstance[property] = 0;
                    }
                }
            }
        }

        // we need to recheck if there are more
        // than 2 cursor instances with 0 size
        if (zeroCursorAmount >= 2) {
            this.is3Finger = false;
            this.penalty = 1;
            return;
        }

        const nerfFactors = [];

        // in here we only filter cursor instances that are above the strain threshold
        // this minimalizes the amount of cursor instances to analyze
        for (let i = 0; i < objects.length; i++) {
            const object = objects[i];
            const speedStrain = object.strains[0];
            const replayObject = this.data.hit_object_data[i];

            if (isNaN(firstTime)) {
                // ignore any speed strain below threshold
                if (speedStrain < STRAIN_THRESHOLD) {
                    continue;
                }
                // insert time interval to determine
                // the section to be searched
                firstTime = object.obj.time;
                strainIndexStart = i;
                cumulativeStrain += speedStrain;

                // we need to see the hit result in order
                // to improve time interval accuracy
                switch (replayObject.result) {
                    case hitResult.RESULT_0:
                    case hitResult.RESULT_50:
                        firstTime -= 250 + 10 * (5 - od);
                        break;
                    case hitResult.RESULT_100:
                        firstTime -= 150 + 10 * (5 - od);
                        break;
                    case hitResult.RESULT_300:
                        firstTime -= 75 + 5 * (5 - od);
                }
                continue;
            }

            cumulativeStrain += speedStrain - STRAIN_THRESHOLD;
            if (replayObject.result !== hitResult.RESULT_0) {
                cumulativeAcc += replayObject.accuracy;
            }
            
            // now that we determine the start time to detect,
            // we would want to determine the end time to detect
            //
            // in that case, we detect if speed strain goes
            // below the threshold to determine the end time
            if (speedStrain > STRAIN_THRESHOLD && i + 1 !== objects.length) {
                continue;
            }

            // subtract the last speed strain since it is less than 200
            cumulativeStrain -= speedStrain - STRAIN_THRESHOLD;

            // ignore if object count is less than or equal to 5
            if (i - strainIndexStart <= 5) {
                // reset everything to detect next section
                firstTime = lastTime = Number.NaN;
                cumulativeStrain = cumulativeAcc = 0;
                continue;
            }

            // when strain goes below threshold, end the section
            // and mark the time
            lastTime = objects[i - 1].obj.time;

            // we need to see the hit result in order
            // to improve time interval accuracy
            switch (replayObject.result) {
                case hitResult.RESULT_0:
                case hitResult.RESULT_50:
                    lastTime += 250 + 10 * (5 - od);
                    break;
                case hitResult.RESULT_100:
                    lastTime += 150 + 10 * (5 - od);
                    break;
                case hitResult.RESULT_300:
                    lastTime += 75 + 5 * (5 - od);
            }

            // filter cursor instances during section
            const cursorAmounts = [];
            for (let j = 0; j < newCursorInstances.length; j++) {
                const cursorData = newCursorInstances[j];
                let amount = 0;
                for (let k = 0; k < cursorData.size; k++) {
                    if (cursorData.time[k] >= firstTime && cursorData.time[k] <= lastTime) {
                        ++amount;
                    }
                }
                cursorAmounts.push(amount);
            }

            const currentTotalCursorAmount = cursorAmounts.reduce((acc, value) => acc + value);
            // apply palm rejection for drag/tablet plays
            const cursorTapIndex = newCursorInstances.findIndex(cursor => cursor.size / currentTotalCursorAmount < THREE_FINGER_THRESHOLD * 5 && cursor.size <= breakPoints.length);

            let is3Finger;
            switch (cursorTapIndex) {
                case 0:
                    is3Finger = (cursorAmounts[3] + cursorAmounts[4]) / (cursorAmounts[1] + cursorAmounts[2]) > THREE_FINGER_THRESHOLD;
                    break;
                case 1:
                    is3Finger = (cursorAmounts[3] + cursorAmounts[4]) / (cursorAmounts[0] + cursorAmounts[2]) > THREE_FINGER_THRESHOLD;
                    break;
                case 2:
                    is3Finger = (cursorAmounts[3] + cursorAmounts[4]) / (cursorAmounts[0] + cursorAmounts[1]) > THREE_FINGER_THRESHOLD;
                    break;
                case 3:
                    is3Finger = (cursorAmounts[2] + cursorAmounts[4]) / (cursorAmounts[0] + cursorAmounts[1]) > THREE_FINGER_THRESHOLD;
                    break;
                case 4:
                    is3Finger = (cursorAmounts[2] + cursorAmounts[3]) / (cursorAmounts[0] + cursorAmounts[1]) > THREE_FINGER_THRESHOLD;
                    break;
                default:
                    is3Finger = (cursorAmounts[2] + cursorAmounts[3] + cursorAmounts[4]) / (cursorAmounts[0] + cursorAmounts[1]) > THREE_FINGER_THRESHOLD;
            }

            if (is3Finger) {
                // strain standard deviation and section UR (unstable rate) calculation
                const objectCount = i - strainIndexStart;
                const strainMean = cumulativeStrain / objectCount;
                const accMean = cumulativeAcc / objectCount;
                let temporaryStrainSum = 0;
                let temporaryAccSum = 0;
                for (let j = strainIndexStart; j <= i; ++j) {
                    temporaryStrainSum += Math.pow(objects[j].strains[0] - strainMean, 2);
                    const hitData = this.data.hit_object_data[j];
                    if (hitData.result !== hitResult.RESULT_0) {
                        temporaryAccSum += Math.pow(hitData.accuracy - accMean, 2);
                    }
                }

                const strainStandardDeviation = Math.sqrt(temporaryStrainSum / objectCount);
                const urOnSection = Math.sqrt(temporaryAccSum / objectCount);
                
                // original nerf factor consists of UR during section
                // and the section's strain standard deviation
                //
                // more strain and worse UR = more penalty
                let nerfFactor = 1 +
                    0.0075 * Math.sqrt(urOnSection) *
                    Math.sqrt(strainStandardDeviation / 1.5) *
                    Math.pow(Math.max(1, currentTotalCursorAmount / objectCount), 0.9);

                let fingerCount = 0;

                // length factor consists of length
                // during section and the map's length
                //
                // in long maps, the penalty will be decreased
                const lengthFactor = 1 - Math.pow(objectCount / objects.length, 1.129841);

                // we can skip the first 2 cursor instances since
                // they are guaranteed not 3 finger
                for (let k = 2; k < cursorAmounts.length; ++k) {
                    if (k === cursorTapIndex || !cursorAmounts[k]) {
                        continue;
                    }

                    ++fingerCount;
                    // finger factor applies more penalty if more fingers were used
                    const fingerFactor = 0.183847 * Math.pow(fingerCount, 0.483817);

                    // cursor factor applies penalty based on the amount
                    // of cursors and object during section
                    //
                    // this is intended to nerf mashed sections
                    const cursorFactor = Math.pow(cursorAmounts[k] / objectCount, 3.5);

                    // strain factor varies based on current finger count
                    // this also applies more penalty if more fingers were used
                    const strainFactor = Math.pow(strainStandardDeviation / 2, 0.184344 * Math.pow(fingerCount, 1.5));

                    nerfFactor *= 1 + fingerFactor * cursorFactor * strainFactor / lengthFactor;
                }
                nerfFactors.push(nerfFactor);
            }

            // reset everything to detect next section
            firstTime = lastTime = Number.NaN;
            cumulativeStrain = cumulativeAcc = 0;
        }

        // apply nerf if available
        if (nerfFactors.length > 0) {
            // convert droid aim star rating to PC star rating
            const aim = Math.pow(this.map.aim, 1.25);
            const speed = this.map.speed;

            // nerf factors are sorted in descending order and then
            // applied with weighting
            nerfFactors.sort((a, b) => {
                return a - b;
            });
            
            const nerfFactorSum = nerfFactors.reduce((acc, value, index) => acc + Math.pow(value, Math.pow(1.01, index)));
            const nerfFactorMean = nerfFactorSum / nerfFactors.length;

            // difficulty factor nerfs heavily aim-based or speed-based maps
            //
            // while difficulty calculation buffs heavily aim-based or
            // speed-based maps, they tend to be mashed more
            const difficultyFactor = 1 + Math.pow(Math.abs(speed - aim) / aim, 1.8);
            
            const finalNerfFactor = Math.pow(
                nerfFactorMean * difficultyFactor,
                1.1
            );

            this.penalty *= Math.max(1, finalNerfFactor);
            this.is3Finger = true;
        }
    }
}

module.exports = ReplayAnalyzer;