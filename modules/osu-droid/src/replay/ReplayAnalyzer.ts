import { Parse } from 'unzipper';
import * as javaDeserialization from 'java-deserialization';
import { Readable } from 'stream';
import { Beatmap } from '../beatmap/Beatmap';
import { StarRating } from '../difficulty/StarRating';
import { ReplayData, ReplayInformation } from './data/ReplayData';
import { CursorData } from './data/CursorData';
import { ReplayObjectData } from './data/ReplayObjectData';
import { mods } from '../utils/mods';
import { movementType } from '../constants/movementType';
import { HitObject } from '../beatmap/hitobjects/HitObject';
import { DroidHitWindow } from '../utils/HitWindow';
import { hitResult } from '../constants/hitResult';
import { MapStats } from '../utils/MapStats';
import { modes } from '../constants/modes';
import { BreakPoint } from '../beatmap/timings/BreakPoint';
import { DifficultyHitObject } from '../beatmap/hitobjects/DifficultyHitObject';
import { DroidAPIRequestBuilder, RequestResponse } from '../utils/APIRequestBuilder';
import { Vector2 } from '../mathutil/Vector2';
import { Spinner } from '../beatmap/hitobjects/Spinner';

interface NerfFactor {
    readonly value: number;
    readonly objectCount: number;
}

interface DragSection {
    readonly index: number;
    readonly startTime: number;
    readonly endTime: number;
}

/**
 * A replay analyzer that analyzes a replay from osu!droid.
 * 
 * Created by reverse engineering the replay parser from the game itself, which can be found {@link https://github.com/osudroid/osu-droid/blob/master/src/ru/nsu/ccfit/zuev/osu/scoring/Replay.java here}.
 * 
 * Once analyzed, the result can be accessed via the `data` property.
 */
export class ReplayAnalyzer {
    /**
     * The score ID of the replay.
     */
    scoreID: number;

    /**
     * The original odr file of the replay.
     */
    originalODR: Buffer|null = null;

    /**
     * The fixed odr file of the replay.
     */
    fixedODR: Buffer|null = null;

    /**
     * Whether or not the play is considered using >=3 finger abuse.
     */
    is3Finger?: boolean;

    /**
     * The beatmap that is being analyzed. `StarRating` is required for penalty analyzing.
     */
    map?: Beatmap|StarRating;

    /**
     * The results of the analyzer. `null` when initialized.
     */
    data: ReplayData|null = null;

    /**
     * Penalty value used to penaltize dpp for 3 finger abuse.
     */
    penalty: number = 1;

    /**
     * The amount of cursor that doesn't count as accidental taps for each cursor instance.
     */
    readonly processedCursorMovement: number[] = [];

    isDrag: boolean = false;

    private readonly BYTE_LENGTH = 1;
    private readonly SHORT_LENGTH = 2;
    private readonly INT_LENGTH = 4;
    private readonly LONG_LENGTH = 8;

    constructor(values: {
        /**
         * The ID of the score.
         */
        scoreID: number,

        /**
         * The beatmap to analyze.
         * 
         * Using `StarRating` is required to analyze for 3 finger play.
         */
        map?: Beatmap|StarRating
    }) {
        this.scoreID = values.scoreID;
        this.map = values.map;
    }

    /**
     * Analyzes a replay.
     */
    async analyze(): Promise<ReplayAnalyzer> {
        if (!this.originalODR && !this.fixedODR) {
            this.originalODR = await this.downloadReplay();
        }

        if (!this.originalODR) {
            return this;
        }

        if (!this.fixedODR) {
            this.fixedODR = await this.decompress();
        }

        if (!this.fixedODR) {
            return this;
        }
        
        this.parseReplay();
        // this.analyzeReplay();
        return this;
    }

    /**
     * Downloads the given score ID's replay.
     */
    private downloadReplay(): Promise<Buffer|null> {
        return new Promise(async resolve => {
            const apiRequestBuilder: DroidAPIRequestBuilder = new DroidAPIRequestBuilder()
                .setRequireAPIkey(false)
                .setEndpoint("upload")
                .addParameter("", `${this.scoreID}.odr`);

            const result: RequestResponse = await apiRequestBuilder.sendRequest();
            if (result.statusCode !== 200) {
                console.log("Replay not found");
                return resolve(null);
            }
            resolve(result.data);
        });
    }

    /**
     * Decompresses a replay.
     * 
     * The decompressed replay is in a form of Java object. This will be converted to a buffer and deserialized to read data from the replay.
     */
    private decompress(): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const stream: Readable = new Readable();
            stream.push(this.originalODR);
            stream.push(null);
            stream.pipe(Parse())
                .on("entry", async entry => {
                    const fileName: string = entry.path;
                    if (fileName === "data") {
                        return resolve(await entry.buffer());
                    } else {
                        entry.autodrain();
                    }
                })
                .on("error", e => {
                    setTimeout(() => reject(e), 2000);
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

        const resultObject: ReplayInformation = {
            replayVersion: rawObject[0].version,
            folderName: rawObject[1],
            fileName: rawObject[2],
            hash: rawObject[3],
            cursorMovement: [],
            hitObjectData: []
        };

        if (resultObject.replayVersion >= 3) {
            resultObject.time = new Date(Number(rawObject[4].readBigUInt64BE(0)));
            resultObject.hit300k = rawObject[4].readInt32BE(8);
            resultObject.hit300 = rawObject[4].readInt32BE(12);
            resultObject.hit100k = rawObject[4].readInt32BE(16);
            resultObject.hit100 = rawObject[4].readInt32BE(20);
            resultObject.hit50 = rawObject[4].readInt32BE(24);
            resultObject.hit0 = rawObject[4].readInt32BE(28);
            resultObject.score = rawObject[4].readInt32BE(32);
            resultObject.maxCombo = rawObject[4].readInt32BE(36);
            resultObject.accuracy = rawObject[4].readFloatBE(40);
            resultObject.isFullCombo = !!(rawObject[4][44]);
            resultObject.playerName = rawObject[5];
            resultObject.rawMods = rawObject[6].elements;
            resultObject.droidMods = this.convertDroidMods(rawObject[6].elements);
            resultObject.convertedMods = this.convertMods(rawObject[6].elements);
        }

        if (resultObject.replayVersion >= 4) {
            const s: string[] = rawObject[7].split("|");
            resultObject.speedModification = parseFloat(s[0].replace("x", "")) || 1;
            if (s.length > 1) {
                resultObject.forcedAR = parseFloat(s[1].replace("AR", ""));
            }
        }

        let bufferIndex: number;
        switch (true) {
            // replay v4 and above
            case resultObject.replayVersion >= 4:
                bufferIndex = 8;
                break;
            // replay v3
            case resultObject.replayVersion === 3:
                bufferIndex = 7;
                break;
            // replay v1 and v2
            default:
                bufferIndex = 4;
        }

        const replayDataBufferArray: Buffer[] = [];
        for (let i = bufferIndex; i < rawObject.length; ++i) {
            replayDataBufferArray.push(rawObject[i]);
        }

        // merge all cursor movement and hit object data section into one for better control when parsing
        const replayDataBuffer: Buffer = Buffer.concat(replayDataBufferArray);
        let bufferCounter: number = 0;

        const size: number = replayDataBuffer.readInt32BE(bufferCounter);
        bufferCounter += this.INT_LENGTH;

        // parse movement data
        for (let x = 0; x < size; x++) {
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
            resultObject.cursorMovement.push(moveArray);
        }

        const replayObjectLength: number = replayDataBuffer.readInt32BE(bufferCounter);
        bufferCounter += this.INT_LENGTH;

        // parse result data
        for (let i = 0; i < replayObjectLength; i++) {
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
                const bytes: number[] = [];

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

            resultObject.hitObjectData.push(replayObjectData);
        }

        // parse hit results and accuracy in old replay version
        if (resultObject.replayVersion < 3 && (this.map instanceof StarRating || this.map instanceof Beatmap)) {
            let hit300: number = 0;
            let hit300k: number = 0;
            let hit100: number = 0;
            let hit100k: number = 0;
            let hit50: number = 0;
            let hit0: number = 0;
            let grantsGekiOrKatu: boolean = true;

            const objects: HitObject[] = this.map instanceof StarRating ? (this.map?.map?.objects as HitObject[]) : this.map?.objects;

            for (let i = 0; i < resultObject.hitObjectData.length; ++i) {
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

            const totalHits = hit300 + hit100 + hit50 + hit0;
            resultObject.accuracy = (hit300 * 300 + hit100 * 100 + hit50 * 50) / (totalHits * 300);
        }

        this.data = new ReplayData(resultObject);
    }

    /**
     * Converts replay mods to droid mod string.
     */
    private convertDroidMods(replayMods: string[]): string {
        const replayModsConstants = {
            MOD_NOFAIL: "n",
            MOD_EASY: "e",
            MOD_HIDDEN: "h",
            MOD_HARDROCK: "r",
            MOD_DOUBLETIME: "d",
            MOD_HALFTIME: "t",
            MOD_NIGHTCORE: "c",
            MOD_PRECISE: "s",
            MOD_SMALLCIRCLE: "m",
            MOD_SPEEDUP: "b",
            MOD_REALLYEASY: "l",
            MOD_PERFECT: "f",
            MOD_SUDDENDEATH: "u",
            MOD_SCOREV2: "v"
        };

        let modString: string = "";
        for (const mod of replayMods) {
            for (const property in replayModsConstants) {
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
        return mods.droidToPC(this.convertDroidMods(replayMods));
    }

    /**
     * Analyzes a replay.
     */
    private analyzeReplay(): void {
        if (!(this.map instanceof StarRating)) {
            return;
        }
        // strain threshold to start detecting for 3 finger section
        const STRAIN_THRESHOLD: number = 200;
        const THREE_FINGER_THRESHOLD: number = 0.01;

        // filter cursor instances throughout break sections and start/end of map
        const objects: DifficultyHitObject[] = this.map?.objects;
        const breakPoints: BreakPoint[] = this.map?.map?.breakPoints as BreakPoint[];
        const cursorInstances: CursorData[] = this.data?.cursorMovement as CursorData[];
        const objectData: ReplayObjectData[] = this.data?.hitObjectData as ReplayObjectData[];

        const firstObjectOffset: number = objectData[0].accuracy;
        const lastObjectOffset: number = objectData[objectData.length - 1].accuracy;

        const firstObjectHitTime: number = objects[0].object.startTime + firstObjectOffset;
        const lastObjectHitTime: number = objects[objects.length - 1].object.endTime + lastObjectOffset;

        // new cursor instances only consists of cursor with ID movementType.DOWN
        const newCursorInstances: CursorData[] = [];
        let totalCursorAmount: number = 0;
        let zeroCursorAmount: number = 0;

        // since break points do not start right at the start of the hitobject
        // before it and do not end right at the first hitobject after it,
        // we need to get the last hitobject before the start of the break point
        // and the first hitobject after the end of the break point in order to improve accuracy
        const breakPointAccurateTimes: {
            readonly startTime: number,
            readonly endTime: number,
            readonly objectIndex: number
        }[] = [];

        for (const breakPoint of breakPoints) {
            const beforeIndex: number = objects.findIndex((o, i) => o.object.endTime > breakPoint.startTime && objectData[i].result !== hitResult.RESULT_0) - 1;
            const timeBefore: number = objects[beforeIndex].object.endTime + objectData[beforeIndex].accuracy;

            const afterIndex: number = beforeIndex + 1;
            const timeAfter: number = objects[afterIndex].object.startTime + objectData[afterIndex].accuracy;

            breakPointAccurateTimes.push({
                startTime: timeBefore,
                endTime: timeAfter,
                objectIndex: afterIndex
            });
        }

        // filter cursor instances
        for (let i = 0; i < cursorInstances.length; ++i) {
            const cursorInstance: CursorData = cursorInstances[i];
            const newCursorData: CursorData = {
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

                const time: number = cursorInstance.time[j];

                if (time < firstObjectHitTime || time > lastObjectHitTime) {
                    continue;
                }

                let inBreakPoint: boolean = false;
                for (const breakPoint of breakPointAccurateTimes) {
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
            newCursorInstances.push(newCursorData);
        }

        // if there are more than 2 cursor instances with 0 size,
        // it is safe to assume that the play is not 3-fingered,
        // therefore we can skip analysis
        if (zeroCursorAmount >= 2) {
            this.is3Finger = false;
            this.penalty = 1;
            return;
        }

        // TODO: once again find another method for analyzing
        // detect drag play
        //
        // we detect drag play by analyzing if a cursor instance follows hitobjects
        // all the way in a map section, where each map section is divided between breaks
        // (n break points give n+1 map sections).
        //
        // at the end, the index of the cursor instance for each map section is added to
        // an array to be used for further analyzing. if a section's index is -1, it means the section
        // isn't dragged.
        const dragSections: DragSection[] = [];
        if (breakPoints.length > 0) {
            for (let i = 0; i <= breakPointAccurateTimes.length; ++i) {
                const sectionFirstObjectHitTime: number = i > 0 ? breakPointAccurateTimes[i - 1].endTime : firstObjectHitTime;
                const sectionLastObjectHitTime: number = i < breakPointAccurateTimes.length - 1 ? breakPointAccurateTimes[i].startTime : lastObjectHitTime;

                const sectionObjects: DifficultyHitObject[] = [];
                const sectionReplayObjectData: ReplayObjectData[] = [];

                let dragIndex: number = -1;

                for (let j = 0; j < objects.length; ++j) {
                    const o: DifficultyHitObject = objects[j];
                    
                    if (o.object.startTime < (i > 0 ? breakPoints[i - 1].endTime : objects[0].object.startTime)) {
                        continue;
                    }

                    if (o.object.endTime > (i < breakPoints.length - 1 ? breakPoints[i].startTime : objects[objects.length - 1].object.endTime)) {
                        break;
                    }

                    sectionObjects.push(o);
                    sectionReplayObjectData.push(objectData[j]);
                }

                let cursorIndexes: number[] = [];
                for (let j = 0; j < cursorInstances.length; ++j) {                    
                    const c: CursorData = cursorInstances[j];

                    if (c.size === 0) {
                        continue;
                    }

                    // do not include cursors that don't have an occurence in this section.
                    // this speeds up checking process
                    if (c.time.filter(v => v >= sectionFirstObjectHitTime && v <= sectionLastObjectHitTime).length === 0) {
                        continue;
                    }

                    // if this cursor instance doesn't move, it's not the cursor instance we want
                    if (c.id.filter(v => v === movementType.MOVE).length === 0) {
                        continue;
                    }

                    cursorIndexes.push(j);
                }

                // cursorIndexes can have more than 1 cursor instance index, therefore
                // we check which cursor instance follows hitobjects all over
                let objectIndex: number = sectionObjects.findIndex((v, i) => !(v.object instanceof Spinner) && sectionReplayObjectData[i].result !== hitResult.RESULT_0);
                while (cursorIndexes.length > 0) {
                    if (objectIndex === sectionObjects.length) {
                        break;
                    }

                    const o: DifficultyHitObject = sectionObjects[objectIndex];
                    const s: ReplayObjectData = sectionReplayObjectData[objectIndex];
                    ++objectIndex;
                    
                    if (s.result === hitResult.RESULT_0) {
                        continue;
                    }

                    // get the cursor instance that is closest to the object's hit time
                    for (let j = 0; j < cursorIndexes.length; ++j) {
                        const c: CursorData = cursorInstances[cursorIndexes[j]];
                    
                        // cursor instances aren't always recorded at all times,
                        // but about every 80ms
                        let hitIndex: number = -1;
                        const hitTime: number = o.object.startTime + s.accuracy;
                        let minHitTime: number = Number.POSITIVE_INFINITY;
                        for (let k = 0; k < c.size; ++k) {
                            if (c.id[k] === movementType.UP) {
                                continue;
                            }

                            const timeDifference: number = c.time[k] - hitTime;
                            
                            // threshold is +-100ms
                            if (timeDifference < -100) {
                                continue;
                            }

                            if (timeDifference > 100) {
                                break;
                            }

                            if (minHitTime > Math.abs(timeDifference)) {
                                minHitTime = Math.abs(timeDifference);
                                hitIndex = k;
                            }
                        }

                        if (hitIndex === -1) {
                            cursorIndexes[j] = -1;
                            continue;
                        }

                        const hitPosition: Vector2 = new Vector2({
                            x: c.x[hitIndex],
                            y: c.y[hitIndex]
                        });

                        // check if cursor is in the area of the object
                        if (o.object.stackedPosition.getDistance(hitPosition) > o.radius) {
                            cursorIndexes[j] = -1;
                        }
                    }
                    cursorIndexes = cursorIndexes.filter(v => v !== -1);
                }

                // if there are too many cursors, just take the first one (may need to be changed in the future)
                dragIndex = cursorIndexes[0];
                // since there may be zero cursor indexes, check if it's undefined, in which case this isn't a dragged section
                if (dragIndex === undefined) {
                    dragIndex = -1;
                }

                dragSections.push({
                    index: dragIndex,
                    startTime: sectionFirstObjectHitTime,
                    endTime: sectionLastObjectHitTime
                });
            }
        } else {
            const firstObjectHitTime: number = objects[0].object.startTime + objectData[0].accuracy;
            const lastObjectHitTime: number = objects[objects.length - 1].object.startTime + objectData[objectData.length - 1].accuracy;

            let dragIndex: number = -1;

            let cursorIndexes: number[] = [];
            for (let i = 0; i < cursorInstances.length; ++i) {
                const c: CursorData = cursorInstances[i];

                if (c.size === 0) {
                    continue;
                }

                // if this cursor instance doesn't move, it's not the cursor instance we want
                if (c.id.filter(v => v === movementType.MOVE).length === 0) {
                    continue;
                }

                cursorIndexes.push(i);
            }

            // cursorIndexes can have more than 1 cursor instance index, therefore
            // we check which cursor instance follows hitobjects all over
            let objectIndex: number = objects.findIndex((v, i) => !(v.object instanceof Spinner) && objectData[i].result !== hitResult.RESULT_0);
            while (cursorIndexes.length > 0) {
                if (objectIndex === objects.length) {
                    break;
                }

                const o: DifficultyHitObject = objects[objectIndex];
                const s: ReplayObjectData = objectData[objectIndex];
                ++objectIndex;

                if (s.result === hitResult.RESULT_0) {
                    continue;
                }

                // get the cursor instance that is closest to the object's hit time
                for (let i = 0; i < cursorIndexes.length; ++i) {
                    const c: CursorData = cursorInstances[cursorIndexes[i]];

                    // cursor instances aren't always recorded at all times,
                    // but about every 80ms
                    let hitIndex: number = -1;
                    const hitTime: number = o.object.startTime + s.accuracy;
                    let minHitTime: number = Number.POSITIVE_INFINITY;
                    for (let k = 0; k < c.size; ++k) {
                        if (c.id[k] === movementType.UP) {
                            continue;
                        }
                        
                        const timeDifference: number = c.time[k] - hitTime;
                        
                        // threshold is +-100ms
                        if (timeDifference < -100) {
                            continue;
                        }

                        if (timeDifference > 100) {
                            break;
                        }

                        if (minHitTime > Math.abs(timeDifference)) {
                            minHitTime = Math.abs(timeDifference);
                            hitIndex = k;
                        }
                    }

                    if (hitIndex === -1) {
                        cursorIndexes[i] = -1;
                        continue;
                    }

                    const hitPosition: Vector2 = new Vector2({
                        x: c.x[hitIndex],
                        y: c.y[hitIndex]
                    });

                    // check if cursor is in the area of the object
                    if (o.object.stackedPosition.getDistance(hitPosition) > o.radius) {
                        cursorIndexes[i] = -1;
                    }
                }

                cursorIndexes = cursorIndexes.filter(v => v !== -1);
            }

            // if there are too many cursors, just take the first one (may need to be changed in the future)
            dragIndex = cursorIndexes[0];
            // since there may be zero cursor indexes, check if it's undefined, in which case this isn't a dragged section
            if (dragIndex === undefined) {
                dragIndex = -1;
            }
            
            dragSections.push({
                index: dragIndex,
                startTime: firstObjectHitTime,
                endTime: lastObjectHitTime
            });
        }
        const isDrag: boolean = dragSections.some(v => v.index !== -1);
        this.isDrag = isDrag;

        // this index will be used to detect if a section is 3-fingered.
        // if the section is dragged, the dragged instance will be ignored,
        // hence why the index is 1 less than nondragged plays
        const fingerSplitIndex: number = isDrag ? 2 : 3;

        // try to prevent accidental taps
        for (let i = 0; i < newCursorInstances.length; ++i) {
            const cursorInstance: CursorData = newCursorInstances[i];
            // use an estimation for accidental tap threshold
            if (cursorInstance.size > 0 && cursorInstance.size <= Math.ceil(objects.length / 400) && cursorInstance.size / totalCursorAmount < THREE_FINGER_THRESHOLD) {
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

        cursorInstances.map(v => {return v.size;}).forEach((c, i) => console.log(`Original size ${i+1}:`, c));
        newCursorInstances.forEach((cursor, i) => console.log(`Filtered size ${i+1}:`, cursor.size));

        // we need to recheck if there are more
        // than 2 cursor instances with 0 size
        // after filtering accidental taps
        if (zeroCursorAmount >= 2) {
            this.is3Finger = false;
            this.penalty = 1;
            return;
        }

        // time intervals to be used to filter cursor instances
        const od: number = new MapStats(this.map.map as Beatmap).calculate({mode: modes.osu, mods: this.data?.convertedMods}).od as number;
        const isPrecise: boolean = this.data?.convertedMods?.includes("PR") as boolean;
        let startTime: number = Number.NaN;
        let endTime: number = Number.NaN;

        const hitWindow: DroidHitWindow = new DroidHitWindow(od);

        // total strains during a detected section
        let cumulativeStrain: number = 0;

        // total hit accuracy offset during a detected section
        let cumulativeAcc: number = 0;

        // first index of object with strain above strain threshold
        let strainIndexStart: number = 0;
        
        const nerfFactors: NerfFactor[] = [];

        // in here we only filter cursor instances that are above the strain threshold
        // this minimalizes the amount of cursor instances to analyze
        for (let i = 0; i < objects.length; ++i) {
            const object: DifficultyHitObject = objects[i];
            const speedStrain: number = object.speedStrain;
            const replayObject: ReplayObjectData = this.data?.hitObjectData[i] as ReplayObjectData;

            if (isNaN(startTime)) {
                // ignore any speed strain below threshold
                if (speedStrain < STRAIN_THRESHOLD) {
                    continue;
                }
                // insert time interval to determine
                // the section to be searched
                startTime = object.object.startTime + replayObject.accuracy;

                // sometimes missed objects have wack accuracy,
                // therefore if the object was missed, use the
                // maximum hit window threshold for meh (50) hit result
                if (replayObject.result === hitResult.RESULT_0) {
                    startTime -= replayObject.accuracy + hitWindow.hitWindowFor50(isPrecise);
                }

                strainIndexStart = i;
                cumulativeStrain += speedStrain - STRAIN_THRESHOLD;
                continue;
            }

            cumulativeStrain += speedStrain - STRAIN_THRESHOLD;
            if (replayObject.result !== hitResult.RESULT_0) {
                cumulativeAcc += replayObject.accuracy;
            }

            // now that we determine the start time to detect,
            // we would want to determine the end time
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
                startTime = endTime = Number.NaN;
                cumulativeStrain = cumulativeAcc = 0;
                continue;
            }

            // when strain goes below threshold, end the section
            // and mark the time
            endTime = objects[i - 1].object.endTime + replayObject.accuracy;

            // sometimes missed objects have wack accuracy,
            // therefore if the object was missed, use the
            // maximum hit window threshold for meh (50) hit result
            if (replayObject.result === hitResult.RESULT_0) {
                endTime += hitWindow.hitWindowFor50(isPrecise) - replayObject.accuracy;
            }

            // filter cursor instances during section
            newCursorInstances.forEach(c => {
                const i: number = c.time.findIndex(t => t >= startTime);
                if (i !== -1) {
                    c.size -= i;
                    c.time.splice(0, i);
                    c.x.splice(0, i);
                    c.y.splice(0, i);
                    c.id.splice(0, i);
                }
            });
            const section: DragSection|undefined = dragSections.find(v => v.startTime <= startTime && v.endTime >= endTime);
            const dragIndex: number = section?.index ?? -1;
            const cursorAmounts: number[] = [];
            for (let j = 0; j < newCursorInstances.length; ++j) {
                // do not include drag cursor instance
                if (j === dragIndex) {
                    continue;
                }
                const cursorData: CursorData = newCursorInstances[j];
                let amount = 0;
                for (let k: number = 0; k < cursorData.size; ++k) {
                    if (cursorData.time[k] >= startTime && cursorData.time[k] <= endTime) {
                        ++amount;
                    }
                }
                cursorAmounts.push(amount);
            }

            let currentTotalCursorAmount: number = cursorAmounts.reduce((acc, value) => acc + value);

            // divide >=4th (3rd for drag) cursor instances with 1st + 2nd (+ 3rd for nondrag)
            // to check if the section is 3-fingered
            let is3Finger: boolean =
                cursorAmounts.slice(0, fingerSplitIndex).reduce((acc, value) => acc + value) /
                cursorAmounts.slice(fingerSplitIndex).reduce((acc, value) => acc + value)
                > THREE_FINGER_THRESHOLD;


            if (is3Finger) {
                // strain standard deviation and section UR (unstable rate) calculation
                const objectCount: number = i - strainIndexStart - 1;
                const strainMean: number = cumulativeStrain / objectCount;
                const accMean: number = cumulativeAcc / objectCount;

                let temporaryStrainSum: number = 0;
                let temporaryAccSum: number = 0;
                for (let j = strainIndexStart; j <= i; ++j) {
                    temporaryStrainSum += Math.pow(objects[j].speedStrain - strainMean, 2);
                    const hitData: ReplayObjectData = this.data?.hitObjectData[j] as ReplayObjectData;
                    if (hitData.result !== hitResult.RESULT_0) {
                        temporaryAccSum += Math.pow(hitData.accuracy - accMean, 2);
                    }
                }

                const strainStandardDeviation: number = Math.sqrt(temporaryStrainSum / objectCount);
                const strainFactor: number = (strainStandardDeviation - 195) / 5;
                const urOnSection: number = Math.sqrt(temporaryAccSum / objectCount);

                // we can ignore the first 3 (2 for drag) cursor instances
                // since they are guaranteed not 3 finger
                const threeFingerCursorAmounts: number[] = cursorAmounts.slice(fingerSplitIndex).filter(amount => amount > 0);

                // finger factor applies more penalty if more fingers were used
                const fingerFactor: number = threeFingerCursorAmounts.reduce((acc, value, index) =>
                    acc * Math.max(1, Math.pow((index + 1) * value / objectCount, 2)),
                    1
                );

                // length factor consists of length
                // during section and the map's length
                const lengthFactor: number = 1 + Math.pow(objectCount / objects.length, 1.2);

                const mashFactor: number = Math.pow(2, (currentTotalCursorAmount - objectCount) / objectCount);

                const nerfFactor: number = 1 +
                    0.01 * Math.sqrt(urOnSection * strainFactor) *
                    mashFactor * fingerFactor * strainFactor * lengthFactor;

                nerfFactors.push({
                    value: nerfFactor,
                    objectCount: objectCount
                });
            }

            // reset everything to detect next section
            startTime = endTime = Number.NaN;
            cumulativeStrain = cumulativeAcc = 0;
        }

        // apply nerf if available
        if (nerfFactors.length > 0) {
            const aim: number = this.map.aim;
            const speed: number = this.map.speed;
            
            const nerfFactorSum: number = nerfFactors.map(n => {return n.value;}).reduce((acc, value) => acc + Math.pow(value, 0.99));
            const nerfFactorMean: number = nerfFactorSum / nerfFactors.length;

            // the amount of objects in sections that were 3-fingered
            const objectCount: number = nerfFactors.map(n => {return n.objectCount;}).reduce((acc, value) => acc + value);

            // difficulty factor nerfs heavily speed-based maps
            //
            // while difficulty calculation buffs heavily
            // speed-based maps, they tend to be mashed more
            const difficultyFactor: number = Math.max(1, Math.pow(speed / aim, 0.2));

            // three finger amount factor nerfs speed based on how
            // many objects were 3-fingered in contrast of map length
            const threeFingerAmountFactor: number = 1 + objectCount / objects.length;
            
            const finalNerfFactor: number = Math.pow(
                nerfFactorMean * difficultyFactor * threeFingerAmountFactor,
                1.1
            );

            console.log("Is drag:", isDrag);
            console.log("Drag indexes:", dragSections.map(v => {return v.index;}));
            console.log("Total cursor amount:", totalCursorAmount);
            console.log("Object count:", objects.length);
            console.log("3 fingered object count:", objectCount);
            console.log("Aim rating:", aim);
            console.log("Speed rating:", speed);
            console.log("Nerf factor mean:", nerfFactorMean);
            console.log("Difficulty factor:", difficultyFactor);
            console.log("3 finger amount factor:", threeFingerAmountFactor);
            console.log("Final nerf factor:", finalNerfFactor);

            this.penalty *= Math.max(1, finalNerfFactor);
            this.is3Finger = true;
        }
    }
}