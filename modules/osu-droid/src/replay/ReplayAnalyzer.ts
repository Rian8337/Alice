import { Parse } from 'unzipper';
import * as javaDeserialization from 'java-deserialization';
import { Readable } from 'stream';
import { Beatmap } from '../beatmap/Beatmap';
import { DroidStarRating } from '../difficulty/DroidStarRating';
import { ReplayData, ReplayInformation } from './data/ReplayData';
import { CursorData } from './data/CursorData';
import { ReplayObjectData } from './data/ReplayObjectData';
import { mods } from '../utils/mods';
import { movementType } from '../constants/movementType';
import { HitObject } from '../beatmap/hitobjects/HitObject';
import { hitResult } from '../constants/hitResult';
import { DroidAPIRequestBuilder, RequestResponse } from '../utils/APIRequestBuilder';
import { ThreeFingerChecker, ThreeFingerInformation } from './analysis/ThreeFingerChecker';
import { TwoHandChecker } from './analysis/TwoHandChecker';

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
     * Whether or not the play is considered 2-handed.
     */
    is2Hand?: boolean;

    /**
     * The beatmap that is being analyzed. `DroidStarRating` is required for penalty analyzing.
     */
    map?: Beatmap|DroidStarRating;

    /**
     * The results of the analyzer. `null` when initialized.
     */
    data: ReplayData|null = null;

    /**
     * Penalty value used to penalize dpp for 2-hand.
     */
    aimPenalty: number = 1;

    /**
     * Penalty value used to penalize dpp for 3 finger abuse.
     */
    tapPenalty: number = 1;

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
         * Using `DroidStarRating` is required to analyze for 3 finger play.
         */
        map?: Beatmap|DroidStarRating
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
            this.fixedODR = await this.decompress().catch(() => {return null;});
        }

        if (!this.fixedODR) {
            return this;
        }

        this.parseReplay();
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
        let rawObject: any[];
        try {
            rawObject = javaDeserialization.parse(this.fixedODR);
        } catch (ignored) {
            return;
        }

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
        for (bufferIndex; bufferIndex < rawObject.length; ++bufferIndex) {
            replayDataBufferArray.push(rawObject[bufferIndex]);
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
                // Int/int division in Java; numbers must be truncated to get actual number
                for (let j = 0; j < len * 8; j++) {
                    replayObjectData.tickset[j] = (bytes[len - Math.trunc(j / 8) - 1] & 1 << Math.trunc(j % 8)) !== 0;
                }
            }

            if (resultObject.replayVersion >= 1) {
                replayObjectData.result = replayDataBuffer.readInt8(bufferCounter);
                bufferCounter += this.BYTE_LENGTH;
            }

            resultObject.hitObjectData.push(replayObjectData);
        }

        // parse hit results and accuracy in old replay version
        if (resultObject.replayVersion < 3 && (this.map instanceof DroidStarRating || this.map instanceof Beatmap)) {
            let hit300: number = 0;
            let hit300k: number = 0;
            let hit100: number = 0;
            let hit100k: number = 0;
            let hit50: number = 0;
            let hit0: number = 0;
            let grantsGekiOrKatu: boolean = true;

            const objects: HitObject[] = this.map instanceof DroidStarRating ? (this.map?.map?.objects as HitObject[]) : this.map?.objects;

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
     * Checks if a play is using 3 fingers.
     * 
     * Requires `analyze()` to be called first and `map` to be defined as `DroidStarRating`.
     */
    checkFor3Finger(): void {
        if (!(this.map instanceof DroidStarRating) || !this.data) {
            throw new Error("Map must be defined");
        }
        
        const threeFingerChecker: ThreeFingerChecker = new ThreeFingerChecker(this.map, this.data);
        const result: ThreeFingerInformation = threeFingerChecker.check();

        this.is3Finger = result.is3Finger;
        this.tapPenalty = result.penalty;
    }

    /**
     * Checks if a play is using 2 hands.
     * 
     * Requires `analyze()` to be called first and `map` to be defined as `DroidStarRating`.
     */
    checkFor2Hand(): void {
        if (!(this.map instanceof DroidStarRating) || !this.data) {
            return;
        }

        const twoHandChecker: TwoHandChecker = new TwoHandChecker(this.map, this.data);
        this.is2Hand = twoHandChecker.check();
    }
}