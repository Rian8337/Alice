import * as request from 'request';
import { Parse } from 'unzipper';
import  * as javaDeserialization from 'java-deserialization';
import { Readable } from 'stream';
import { Beatmap } from '../beatmap/Beatmap';
import { StandardDiff } from '../difficulty/StandardDiff';
import { ReplayData, ReplayInformation } from './data/ReplayData';
import { CursorData } from './data/CursorData';
import { ReplayObjectData } from './data/ReplayObjectData';
import { mods } from '../utils/mods';
import { movementType } from '../constants/movementType';
import { HitObject } from '../beatmap/hitobjects/HitObject';
import { hitResult } from '../constants/hitResult';
import { MapStats } from '../utils/MapStats';
import { modes } from '../constants/modes';
import { BreakPoint } from '../beatmap/timings/BreakPoint';
import { StandardDiffHitObject } from '../difficulty/preprocessing/StandardDiffHitObject';

/**
 * A replay analyzer that analyzes a replay from osu!droid with given score ID. This is mainly used to detect whether or not a play is considered using >=3 fingers abuse.
 * 
 * Once analyzed, the result can be accessed via the `data` property.
 */
export class ReplayAnalyzer {
    /**
     * The score ID of the replay.
     */
    public scoreID: number;

    /**
     * The original odr file of the replay.
     */
    public originalODR: Buffer|null;

    /**
     * The fixed odr file of the replay.
     */
    public fixedODR: Buffer|null;

    /**
     * Whether or not the play is considered using >=3 finger abuse.
     */
    public is3Finger?: boolean;

    /**
     * The beatmap that is being analyzed. `StandardDiff` is required for penalty analyzing.
     */
    public map?: Beatmap|StandardDiff;

    /**
     * The results of the analyzer. `null` when initialized.
     */
    public data: ReplayData|null;

    /**
     * Penalty value used to penaltize dpp for 3 finger abuse.
     */
    public penalty: number;

    /**
     * The amount of cursor that doesn't count as accidental taps for each cursor instance.
     */
    public processedCursorMovement: number[];

    private readonly BYTE_LENGTH = 1;
    private readonly SHORT_LENGTH = 2;
    private readonly INT_LENGTH = 4;
    private readonly LONG_LENGTH = 8;

    constructor(values: {
        scoreID: number,
        map?: Beatmap|StandardDiff
    }) {
        this.scoreID = values.scoreID;
        this.originalODR = null;
        this.fixedODR = null;
        this.is3Finger = undefined;
        this.map = values.map;
        this.data = null;
        this.penalty = 1;
        this.processedCursorMovement = [];
    }

    /**
     * Analyzes a replay.
     */
    async analyze(): Promise<ReplayAnalyzer> {
        this.fixedODR = await this.decompress();
        if (!this.fixedODR) {
            return this;
        }
        this.parseReplay();
        // this.analyzeReplay();
        return this;
    }

    /**
     * Downloads and decompresses a replay.
     * 
     * The decompressed replay is in a form of Java object. This will be converted to a buffer and deserialized to read data from the replay.
     */
    private decompress(): Promise<Buffer|null> {
        return new Promise((resolve, reject) => {
            const dataArray: Buffer[] = [];
            const url: string = `http://ops.dgsrz.com/api/upload/${this.scoreID}.odr`;
            request(url, {timeout: 10000})
                .on("data", chunk => {
                    dataArray.push(Buffer.from(chunk));
                })
                .on("complete", response => {
                    if (response.statusCode !== 200) {
                        console.log("Replay not found");
                        return resolve(null);
                    }
                    const result: Buffer = Buffer.concat(dataArray);
                    this.originalODR = result;
                    const stream: Readable = new Readable();
                    stream.push(result);
                    stream.push(null);
                    stream.pipe(Parse())
                        .on("entry", async entry => {
                            const fileName: string = entry.path;
                            if (fileName === "data") {
                                resolve(await entry.buffer());
                            } else {
                                entry.autodrain();
                            }
                        })
                        .on("error", e => {
                            setTimeout(() => reject(e), 2000);
                        });
                })
                .on("error", e => {
                    reject(e);
                });
        });
    }

    /**
     * Parses a replay after being downloaded and converted to a buffer.
     */
    private parseReplay(): void {
        // javaDeserialization can only somewhat parse some string field
        // the rest will be a buffer that we need to manually parse
        const rawObject: any[] = javaDeserialization.parse(this.fixedODR);

        const resultObject: ReplayInformation = rawObject[0].version >= 3 ? {
            replayVersion: rawObject[0].version,
            folderName: rawObject[1],
            fileName: rawObject[2],
            hash: rawObject[3],
            time: Number(rawObject[4].readBigUInt64BE(0)),
            hit300k: rawObject[4].readInt32BE(8),
            hit300: rawObject[4].readInt32BE(12),
            hit100k: rawObject[4].readInt32BE(16),
            hit100: rawObject[4].readInt32BE(20),
            hit50: rawObject[4].readInt32BE(24),
            hit0: rawObject[4].readInt32BE(28),
            score: rawObject[4].readInt32BE(32),
            maxCombo: rawObject[4].readInt32BE(36),
            accuracy: rawObject[4].readFloatBE(40),
            isFullCombo: rawObject[4][44],
            playerName: rawObject[5],
            rawMods: rawObject[6].elements,
            droidMods: this.convertDroidMods(rawObject[6].elements),
            convertedMods: this.convertMods(rawObject[6].elements),
            cursorMovement: [],
            hitObjectData: []
        } : {
            replayVersion: rawObject[0].version,
            folderName: rawObject[1],
            fileName: rawObject[2],
            hash: rawObject[3],
            cursorMovement: [],
            hitObjectData: []
        };

        const replayDataBufferArray: Buffer[] = [];
        for (let i: number = resultObject.replayVersion >= 3 ? 7 : 4; i < rawObject.length; ++i) {
            replayDataBufferArray.push(rawObject[i]);
        }

        // merge all cursor movement and hit object data section into one for better control when parsing
        const replayDataBuffer: Buffer = Buffer.concat(replayDataBufferArray);
        let bufferCounter: number = 0;

        const size: number = replayDataBuffer.readInt32BE(bufferCounter);
        bufferCounter += this.INT_LENGTH;

        // parse movement data
        for (let x: number = 0; x < size; x++) {
            const moveSize: number = replayDataBuffer.readInt32BE(bufferCounter);
            bufferCounter += this.INT_LENGTH;
            const moveArray: CursorData = {
                size: moveSize,
                time: [],
                x: [],
                y: [],
                id: []
            };
            for (let i = 0; i < moveSize; i++) {
                moveArray.time[i] = replayDataBuffer.readInt32BE(bufferCounter);
                bufferCounter += this.INT_LENGTH;
                moveArray.id[i] = moveArray.time[i] & 3;
                moveArray.time[i] >>= 2;
                if (moveArray.id[i] !== movementType.UP) {
                    moveArray.x[i] = replayDataBuffer.readInt16BE(bufferCounter);
                    bufferCounter += this.SHORT_LENGTH;
                    moveArray.y[i] = replayDataBuffer.readInt16BE(bufferCounter);
                    bufferCounter += this.SHORT_LENGTH;
                }
                else {
                    moveArray.x[i] = -1;
                    moveArray.y[i] = -1;
                }
            }
            resultObject.cursorMovement.push(new CursorData(moveArray));
        }

        const replayObjectLength: number = replayDataBuffer.readInt32BE(bufferCounter);
        bufferCounter += this.INT_LENGTH;

        // parse result data
        for (let i: number = 0; i < replayObjectLength; i++) {
            const replayObjectData: ReplayObjectData = {
                accuracy: 0,
                tickset: [],
                result: 0
            };

            replayObjectData.accuracy = replayDataBuffer.readInt16BE(bufferCounter);
            bufferCounter += this.SHORT_LENGTH;
            const len = replayDataBuffer.readInt8(bufferCounter);
            bufferCounter += this.BYTE_LENGTH;

            if (len > 0) {
                const bytes = [];

                for (let j = 0; j < len; j++) {
                    bytes.push(replayDataBuffer.readInt8(bufferCounter));
                    bufferCounter += this.BYTE_LENGTH;
                }

                for (let j = 0; j < len * 8; j++) {
                    replayObjectData.tickset[j] = (bytes[len - j / 8 - 1] & 1 << (j % 8)) !== 0;
                }
            }

            if (resultObject.replayVersion >= 1) {
                replayObjectData.result = replayDataBuffer.readInt8(bufferCounter);
                bufferCounter += this.BYTE_LENGTH;
            }

            resultObject.hitObjectData.push(new ReplayObjectData(replayObjectData));
        }

        // parse hit results in old replay version
        if (resultObject.replayVersion < 3 && (this.map instanceof StandardDiff || this.map instanceof Beatmap)) {
            let hit300: number = 0;
            let hit300k: number = 0;
            let hit100: number = 0;
            let hit100k: number = 0;
            let hit50: number = 0;
            let hit0: number = 0;
            let grantsGekiOrKatu: boolean = true;

            const objects: HitObject[] = this.map instanceof StandardDiff ? (this.map?.map?.objects as HitObject[]) : this.map?.objects;

            for (let i: number = 0; i < resultObject.hitObjectData.length; ++i) {
                const hitObjectData: ReplayObjectData = resultObject.hitObjectData[i];
                const isNextNewCombo: boolean = i + 1 !== objects.length ? objects[i + 1].isNewCombo : true;

                switch (hitObjectData.result) {
                    case hitResult.RESULT_0:
                        ++hit0;
                        grantsGekiOrKatu = false;
                        break;
                    case hitResult.RESULT_50:
                        ++hit50;
                        grantsGekiOrKatu = false;
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

            resultObject.hit300k = hit300k;
            resultObject.hit300 = hit300;
            resultObject.hit100k = hit100k;
            resultObject.hit100 = hit100;
            resultObject.hit50 = hit50;
            resultObject.hit0 = hit0;

            resultObject.accuracy = (hit300 * 300 + hit100 * 100 + hit50 * 50) / (resultObject.hitObjectData.length * 300 * 100);
        }

        this.data = new ReplayData(resultObject);
    }

    /**
     * Converts replay mods to droid mod string.
     */
    private convertDroidMods(replayMods: string[]): string {
        const replayModsConstants = {
            "NOFAIL": "n",
            "EASY": "e",
            "HIDDEN": "h",
            "HARDROCK": "r",
            "DOUBLETIME": "d",
            "HALFTIME": "t",
            "NIGHTCORE": "c"
        };

        let modString: string = "";
        for (const mod in replayMods) {
            for (let property in replayModsConstants) {
                if (!replayModsConstants.hasOwnProperty(property)) {
                    continue;
                }
                if (!mod.includes(property)) {
                    continue;
                }
                modString += replayModsConstants[property as keyof typeof replayModsConstants];
                break;
            }
        }

        return modString;
    }

    /**
     * Converts replay mods to regular mod string.
     */
    private convertMods(replayMods: string[]): string {
        const replayModsBitmask = {
            "NOFAIL": 1<<0,
            "EASY": 1<<1,
            "HIDDEN": 1<<3,
            "HARDROCK": 1<<4,
            "DOUBLETIME": 1<<6,
            "HALFTIME": 1<<8,
            "NIGHTCORE": 1<<9
        };

        let modbits: number = 0;
        for (const mod of replayMods) {
            for (let property in replayModsBitmask) {
                if (!replayModsBitmask.hasOwnProperty(property)) {
                    continue;
                }
                if (!mod.includes(property)) {
                    continue;
                }
                modbits |= replayModsBitmask[property as keyof typeof replayModsBitmask];
                break;
            }
        }

        return mods.modbitsToString(modbits);
    }

    /**
     * Analyzes a replay.
     */
    private analyzeReplay(): void {
        if (!(this.map instanceof StandardDiff)) {
            return;
        }
        // strain threshold to start detecting for 3 finger section
        const STRAIN_THRESHOLD: number = 200;
        const THREE_FINGER_THRESHOLD: number = 0.01;

        // time intervals to be used to filter cursor instances
        const od: number = new MapStats(this.map.map as Beatmap).calculate({mode: modes.osu, mods: this.data?.convertedMods}).od as number;
        let firstTime: number = Number.NaN;
        let lastTime: number = Number.NaN;

        // total strains during a detected section
        let cumulativeStrain: number = 0;

        // total hit accuracy offset during a detected section
        let cumulativeAcc: number = 0;

        // first index of object with strain above strain threshold
        let strainIndexStart: number = 0;

        // filter cursor instances throughout break sections
        const breakPoints: BreakPoint[] = this.map?.map?.breakPoints as BreakPoint[];
        const cursorInstances: CursorData[] = this.data?.cursorMovement as CursorData[];
        const newCursorInstances: CursorData[] = [];
        let totalCursorAmount: number = 0;
        let zeroCursorAmount: number = 0;
        for (let i: number = 0; i < cursorInstances.length; ++i) {
            const cursorInstance: CursorData = cursorInstances[i];
            const newCursorData: CursorData = {
                size: 0,
                time: [],
                x: [],
                y: [],
                id: []
            };

            for (let j: number = 0; j < cursorInstance.size; ++j) {
                if (cursorInstance.id[j] !== movementType.DOWN) {
                    continue;
                }

                const time: number = cursorInstance.time[j];
                let inBreakPoint: boolean = false;
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
            this.processedCursorMovement.push(newCursorData.size);
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

        const objects: StandardDiffHitObject[] = this.map?.objects;

        // try to prevent accidental taps
        for (let i: number = 0; i < newCursorInstances.length; ++i) {
            const cursorInstance: CursorData = newCursorInstances[i];
            // use an estimation for accidental tap threshold
            if (cursorInstance.size > 0 && cursorInstance.size <= Math.ceil(objects.length / 300) && cursorInstance.size / totalCursorAmount < THREE_FINGER_THRESHOLD) {
                ++zeroCursorAmount;
                for (const property in cursorInstance) {
                    const prop = property as keyof CursorData;
                    if (Array.isArray(cursorInstance[prop])) {
                        (cursorInstance[prop] as number[]).length = 0;
                    } else {
                        (cursorInstance[prop] as number) = 0;
                    }
                }
            }
            this.processedCursorMovement[i] = cursorInstance.size;
        }

        newCursorInstances.forEach(cursor => console.log("Size:", cursor.size));

        // we need to recheck if there are more
        // than 2 cursor instances with 0 size
        if (zeroCursorAmount >= 2) {
            this.is3Finger = false;
            this.penalty = 1;
            return;
        }

        const nerfFactors: number[] = [];

        // in here we only filter cursor instances that are above the strain threshold
        // this minimalizes the amount of cursor instances to analyze
        for (let i: number = 0; i < objects.length; ++i) {
            const object: StandardDiffHitObject = objects[i];
            const speedStrain: number = object.strains[0];
            const replayObject: ReplayObjectData = this.data?.hitObjectData[i] as ReplayObjectData;

            if (isNaN(firstTime)) {
                // ignore any speed strain below threshold
                if (speedStrain < STRAIN_THRESHOLD) {
                    continue;
                }
                // insert time interval to determine
                // the section to be searched
                firstTime = object.time;
                strainIndexStart = i;
                cumulativeStrain += speedStrain - STRAIN_THRESHOLD;

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
            lastTime = objects[i - 1].time;

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
                default:
                    lastTime += 75 + 5 * (5 - od);
            }

            // filter cursor instances during section
            const cursorAmounts: number[] = [];
            for (let j: number = 0; j < newCursorInstances.length; j++) {
                const cursorData: CursorData = newCursorInstances[j];
                let amount = 0;
                for (let k: number = 0; k < cursorData.size; k++) {
                    if (cursorData.time[k] >= firstTime && cursorData.time[k] <= lastTime) {
                        ++amount;
                    }
                }
                cursorAmounts.push(amount);
            }

            const currentTotalCursorAmount: number = cursorAmounts.reduce((acc, value) => acc + value);
            // apply palm rejection for drag/tablet plays
            const cursorTapIndex: number = newCursorInstances.findIndex(cursor => cursor.size / currentTotalCursorAmount < THREE_FINGER_THRESHOLD * 5 && cursor.size <= breakPoints.length);

            let is3Finger: boolean;
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
                const objectCount: number = i - strainIndexStart;
                const strainMean: number = cumulativeStrain / objectCount;
                const accMean: number = cumulativeAcc / objectCount;

                let temporaryStrainSum: number = 0;
                let temporaryAccSum: number = 0;
                for (let j = strainIndexStart; j <= i; ++j) {
                    temporaryStrainSum += Math.pow(objects[j].strains[0] - strainMean, 2);
                    const hitData: ReplayObjectData = this.data?.hitObjectData[j] as ReplayObjectData;
                    if (hitData.result !== hitResult.RESULT_0) {
                        temporaryAccSum += Math.pow(hitData.accuracy - accMean, 2);
                    }
                }

                const strainStandardDeviation: number = Math.sqrt(temporaryStrainSum / objectCount);
                const urOnSection: number = Math.sqrt(temporaryAccSum / objectCount);

                // original nerf factor consists of UR during section
                // and the section's strain standard deviation
                //
                // more strain and worse UR = more penalty
                let nerfFactor: number = 1 +
                    0.0075 * Math.sqrt(urOnSection * strainStandardDeviation / 1.5) *
                    Math.pow(Math.max(1, currentTotalCursorAmount / objectCount), 0.9);

                let fingerCount: number = 0;

                // length factor consists of length
                // during section and the map's length
                //
                // in long maps, the penalty will be decreased
                const lengthFactor: number = 1 + Math.pow(objectCount / objects.length, 1.15);

                // we can skip the first 2 cursor instances since
                // they are guaranteed not 3 finger
                for (let k: number = 2; k < cursorAmounts.length; ++k) {
                    if (k === cursorTapIndex || !cursorAmounts[k]) {
                        continue;
                    }

                    ++fingerCount;
                    // finger factor applies more penalty if more fingers were used
                    const fingerFactor: number = 0.183847 * Math.sqrt(fingerCount);

                    // cursor factor applies penalty based on the amount
                    // of cursors and object during section
                    //
                    // this is intended to nerf mashed sections
                    const cursorFactor: number = Math.pow(cursorAmounts[k] / objectCount, 3.5);

                    // strain factor varies based on current finger count
                    // this also applies more penalty if more fingers were used
                    const strainFactor: number = Math.pow(strainStandardDeviation / 2, 0.184344 * Math.pow(fingerCount, 1.5));

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
            const aim: number = Math.pow(this.map.aim, 1.25);
            const speed: number = this.map.speed;

            // nerf factors are sorted in descending order and then
            // applied with weighting
            nerfFactors.sort((a, b) => {
                return a - b;
            });
            
            const nerfFactorSum: number = nerfFactors.reduce((acc, value, index) => acc + Math.pow(value, Math.pow(1.01, index)));
            const nerfFactorMean: number = nerfFactorSum / nerfFactors.length;

            // difficulty factor nerfs heavily aim-based or speed-based maps
            //
            // while difficulty calculation buffs heavily aim-based or
            // speed-based maps, they tend to be mashed more
            const difficultyFactor: number = 1 + Math.pow(Math.abs(speed - aim) / aim, 1.8);
            
            const finalNerfFactor: number = Math.pow(
                nerfFactorMean * difficultyFactor,
                1.1
            );

            console.log("Total cursor amount:", totalCursorAmount);
            console.log("Object count:", objects.length);
            console.log("Aim rating:", aim);
            console.log("Speed rating:", speed);
            console.log("Nerf factor mean:", nerfFactorMean);
            console.log("Difficulty factor:", difficultyFactor);
            console.log("Final nerf factor:", finalNerfFactor);

            this.penalty *= Math.max(1, finalNerfFactor);
            this.is3Finger = true;
        }
    }
}
