import { Circle } from "../../beatmap/hitobjects/Circle";
import { DifficultyHitObject } from "../../difficulty/preprocessing/DifficultyHitObject";
import { Spinner } from "../../beatmap/hitobjects/Spinner";
import { hitResult } from "../../constants/hitResult";
import { movementType } from "../../constants/movementType";
import { DroidStarRating } from "../../difficulty/DroidStarRating";
import { Vector2 } from "../../mathutil/Vector2";
import { DroidHitWindow } from "../../utils/HitWindow";
import { MapStats } from "../../utils/MapStats";
import { CursorData } from "../data/CursorData";
import { ReplayData } from "../data/ReplayData";
import { ReplayObjectData } from "../data/ReplayObjectData";
import { BeatmapSectionGenerator } from "./BeatmapSectionGenerator";
import { BeatmapSection } from "./data/BeatmapSection";
import { ModPrecise } from "../../mods/ModPrecise";
import { ModUtil } from "../../utils/ModUtil";
import { MathUtils } from "../../mathutil/MathUtils";
import { ThreeFingerBeatmapSection } from "./data/ThreeFingerBeatmapSection";
import { Interpolation } from "../../mathutil/Interpolation";

/**
 * Information about the result of a check.
 */
export interface ThreeFingerInformation {
    /**
     * Whether or not the beatmap is 3-fingered.
     */
    readonly is3Finger: boolean;

    /**
     * The final penalty. By default this is 1.
     */
    readonly penalty: number;
}

/**
 * Break points that have their start and end time set right on the
 * nearest object's start time (for beginning) and end time (for end).
 */
interface AccurateBreakPoint {
    /**
     * The start time of the break point.
     */
    readonly startTime: number;

    /**
     * The end time of the break point.
     */
    readonly endTime: number;
}

/**
 * Used to store cursor informations that are placed in a relatively same position.
 */
interface CursorVectorSimilarity {
    vector: Vector2;
    count: number;

    lastTime: number;
}

/**
 * Contains information about factors to nerf, which will be summed in the end.
 */
interface NerfFactor {
    /**
     * Nerf factor from the strain of the section.
     */
    readonly strainFactor: number;

    /**
     * Nerf factor based on the length of the strain.
     */
    readonly lengthFactor: number;

    /**
     * Nerf factor based on how much a section is 3-fingered.
     */
    readonly fingerFactor: number;
}

/**
 * Utility to check whether or not a beatmap is three-fingered.
 */
export class ThreeFingerChecker {
    /**
     * The beatmap to analyze.
     */
    readonly map: DroidStarRating;

    /**
     * The data of the replay.
     */
    readonly data: ReplayData;

    /**
     * The strain threshold to start detecting for 3-fingered section.
     *
     * Increasing this number will result in less sections being flagged.
     */
    private static readonly strainThreshold: number = 175;

    /**
     * The distance threshold between cursors to assume that two cursors are
     * actually pressed with 1 finger in osu!pixels.
     *
     * This is used to prevent cases where a player would lift their finger
     * too fast to the point where the 4th cursor instance or beyond is recorded
     * as 1st, 2nd, or 3rd cursor instance.
     */
    private readonly cursorDistancingDistanceThreshold: number = 60;

    /**
     * The threshold for the amount of cursors that are assumed to be pressed
     * by a single finger.
     */
    private readonly cursorDistancingCountThreshold: number = 10;

    /**
     * The threshold for the time difference of cursors that are assumed to be pressed
     * by a single finger, in milliseconds.
     */
    private readonly cursorDistancingTimeThreshold: number = 1000;

    /**
     * The amount of notes that has a tap strain exceeding `strainThreshold`.
     */
    private readonly strainNoteCount: number;

    /**
     * The ratio threshold between non-3 finger cursors and 3-finger cursors.
     *
     * Increasing this number will increase detection accuracy, however
     * it also increases the chance of falsely flagged plays.
     */
    private readonly threeFingerRatioThreshold: number = 0.01;

    /**
     * The maximum delta time allowed between two beatmap sections.
     *
     * Increasing this number decreases the amount of beatmap sections in general.
     *
     * Note that this value does not account for the speed multiplier of
     * the play, similar to the way replay object data is stored.
     */
    private readonly maxSectionDeltaTime: number = 2000;

    /**
     * The minimum object count required to make a beatmap section.
     *
     * Increasing this number decreases the amount of beatmap sections.
     */
    private readonly minSectionObjectCount: number = 5;

    /**
     * The sections of the beatmap that was cut based on `maxSectionDeltaTime` and `minSectionObjectCount`.
     */
    private readonly beatmapSections: ThreeFingerBeatmapSection[] = [];

    /**
     * This threshold is used to filter out accidental taps.
     *
     * Increasing this number makes the filtration more sensitive, however it
     * will also increase the chance of 3-fingered plays getting out from
     * being flagged.
     */
    private readonly accidentalTapThreshold: number = 400;

    /**
     * The hit window of this beatmap. Keep in mind that speed-changing mods do not change hit window length in game logic.
     */
    private readonly hitWindow: DroidHitWindow;

    /**
     * A reprocessed break points to match right on object time.
     *
     * This is used to increase detection accuracy since break points do not start right at the
     * start of the hitobject before it and do not end right at the first hitobject after it.
     */
    private readonly breakPointAccurateTimes: AccurateBreakPoint[] = [];

    /**
     * A cursor data array that only contains `movementType.DOWN` movement ID occurrences.
     */
    private readonly downCursorInstances: CursorData[] = [];

    /**
     * Nerf factors from all sections that were three-fingered.
     */
    private readonly nerfFactors: NerfFactor[] = [];

    /**
     * @param map The beatmap to analyze.
     * @param data The data of the replay.
     */
    constructor(map: DroidStarRating, data: ReplayData) {
        this.map = map;
        this.data = data;

        const stats: MapStats = new MapStats({
            od: this.map.map.od,
            mods: this.map.mods.filter(
                (m) =>
                    !ModUtil.speedChangingMods
                        .map((v) => v.droidString)
                        .includes(m.droidString)
            ),
        }).calculate();

        this.hitWindow = new DroidHitWindow(stats.od!);

        const strainNotes: DifficultyHitObject[] = map.objects.filter(
            (v) => v.originalTapStrain >= ThreeFingerChecker.strainThreshold
        );
        this.strainNoteCount = strainNotes.length;
    }

    /**
     * Checks whether a beatmap is eligible to be detected for 3-finger.
     */
    static isEligibleToDetect(map: DroidStarRating): boolean {
        return map.objects.some(
            (v) => v.originalTapStrain >= this.strainThreshold
        );
    }

    /**
     * Checks if the given beatmap is 3-fingered and also returns the final penalty.
     *
     * The beatmap will be separated into sections and each section will be determined
     * whether or not it is dragged.
     *
     * After that, each section will be assigned a nerf factor based on whether or not
     * the section is 3-fingered. These nerf factors will be summed up into a final
     * nerf factor, taking beatmap difficulty into account.
     */
    check(): ThreeFingerInformation {
        if (this.strainNoteCount === 0) {
            return { is3Finger: false, penalty: 1 };
        }

        this.getAccurateBreakPoints();
        this.filterCursorInstances();

        if (this.downCursorInstances.filter((v) => v.size > 0).length <= 3) {
            return { is3Finger: false, penalty: 1 };
        }

        this.getBeatmapSections();
        this.detectDragPlay();
        this.getDetailedBeatmapSections();
        this.preventAccidentalTaps();

        if (this.downCursorInstances.filter((v) => v.size > 0).length <= 3) {
            return { is3Finger: false, penalty: 1 };
        }

        this.calculateNerfFactors();

        const finalPenalty: number = this.calculateFinalPenalty();

        return { is3Finger: finalPenalty > 1, penalty: finalPenalty };
    }

    /**
     * Generates a new set of "accurate break points".
     *
     * This is done to increase detection accuracy since break points do not start right at the
     * start of the hitobject before it and do not end right at the first hitobject after it.
     */
    private getAccurateBreakPoints(): void {
        const objects: DifficultyHitObject[] = this.map.objects;
        const objectData: ReplayObjectData[] = this.data.hitObjectData;

        const isPrecise: boolean = this.map.mods.some(
            (m) => m instanceof ModPrecise
        );

        for (const breakPoint of this.map.map.breakPoints) {
            const beforeIndex: number = MathUtils.clamp(
                objects.findIndex(
                    (o) => o.object.endTime >= breakPoint.startTime
                ) - 1,
                0,
                objects.length - 2
            );
            let timeBefore: number = objects[beforeIndex].object.endTime;

            // For sliders and spinners, automatically set hit window length to be as lenient as possible.
            let beforeIndexHitWindowLength: number =
                this.hitWindow.hitWindowFor50(isPrecise);
            switch (objectData[beforeIndex].result) {
                case hitResult.RESULT_300:
                    beforeIndexHitWindowLength =
                        this.hitWindow.hitWindowFor300(isPrecise);
                    break;
                case hitResult.RESULT_100:
                    beforeIndexHitWindowLength =
                        this.hitWindow.hitWindowFor100(isPrecise);
                    break;
                default:
                    beforeIndexHitWindowLength =
                        this.hitWindow.hitWindowFor50(isPrecise);
            }

            timeBefore += beforeIndexHitWindowLength;

            const afterIndex: number = beforeIndex + 1;
            let timeAfter: number = objects[afterIndex].object.startTime;

            // For sliders and spinners, automatically set hit window length to be as lenient as possible.
            let afterIndexHitWindowLength: number =
                this.hitWindow.hitWindowFor50(isPrecise);
            switch (objectData[afterIndex].result) {
                case hitResult.RESULT_300:
                    afterIndexHitWindowLength =
                        this.hitWindow.hitWindowFor300(isPrecise);
                    break;
                case hitResult.RESULT_100:
                    afterIndexHitWindowLength =
                        this.hitWindow.hitWindowFor100(isPrecise);
                    break;
                default:
                    afterIndexHitWindowLength =
                        this.hitWindow.hitWindowFor50(isPrecise);
            }

            timeAfter += afterIndexHitWindowLength;

            this.breakPointAccurateTimes.push({
                startTime: timeBefore,
                endTime: timeAfter,
            });
        }
    }

    /**
     * Filters the original cursor instances, returning only those with `movementType.DOWN` movement ID.
     *
     * This also filters cursors that are in break period or happen before start/after end of the beatmap.
     */
    private filterCursorInstances(): void {
        const objects: DifficultyHitObject[] = this.map.objects;
        const objectData: ReplayObjectData[] = this.data.hitObjectData;

        const firstObjectResult: hitResult = objectData[0].result;
        const lastObjectResult: hitResult = objectData.at(-1)!.result;

        const isPrecise: boolean = this.map.mods.some(
            (m) => m instanceof ModPrecise
        );

        // For sliders, automatically set hit window length to be as lenient as possible.
        let firstObjectHitWindow: number =
            this.hitWindow.hitWindowFor50(isPrecise);
        if (objects[0].object instanceof Circle) {
            switch (firstObjectResult) {
                case hitResult.RESULT_300:
                    firstObjectHitWindow =
                        this.hitWindow.hitWindowFor300(isPrecise);
                    break;
                case hitResult.RESULT_100:
                    firstObjectHitWindow =
                        this.hitWindow.hitWindowFor100(isPrecise);
                    break;
                default:
                    firstObjectHitWindow =
                        this.hitWindow.hitWindowFor50(isPrecise);
            }
        }

        // For sliders, automatically set hit window length to be as lenient as possible.
        let lastObjectHitWindow: number =
            this.hitWindow.hitWindowFor50(isPrecise);
        if (objects.at(-1)!.object instanceof Circle) {
            switch (lastObjectResult) {
                case hitResult.RESULT_300:
                    lastObjectHitWindow =
                        this.hitWindow.hitWindowFor300(isPrecise);
                    break;
                case hitResult.RESULT_100:
                    lastObjectHitWindow =
                        this.hitWindow.hitWindowFor100(isPrecise);
                    break;
                default:
                    lastObjectHitWindow =
                        this.hitWindow.hitWindowFor50(isPrecise);
            }
        }

        // These hit time uses hit window length as threshold.
        // This is because cursors aren't recorded exactly at hit time,
        // probably due to the game's behavior.
        const firstObjectHitTime: number =
            objects[0].object.startTime - firstObjectHitWindow;
        const lastObjectHitTime: number =
            objects.at(-1)!.object.startTime + lastObjectHitWindow;

        for (let i = 0; i < this.data.cursorMovement.length; ++i) {
            const cursorInstance: CursorData = this.data.cursorMovement[i];
            const newCursorData: CursorData = new CursorData({
                size: 0,
                time: [],
                x: [],
                y: [],
                id: [],
            });

            for (let j = 0; j < cursorInstance.size; ++j) {
                if (cursorInstance.id[j] !== movementType.DOWN) {
                    continue;
                }

                const time: number = cursorInstance.time[j];

                if (time < firstObjectHitTime || time > lastObjectHitTime) {
                    continue;
                }

                if (
                    this.breakPointAccurateTimes.some(
                        (v) => time >= v.startTime && time <= v.endTime
                    )
                ) {
                    continue;
                }

                ++newCursorData.size;
                newCursorData.time.push(time);
                newCursorData.x.push(cursorInstance.x[j]);
                newCursorData.y.push(cursorInstance.y[j]);
                newCursorData.id.push(cursorInstance.id[j]);
            }

            this.downCursorInstances.push(newCursorData);
        }
    }

    /**
     * Divides the beatmap into sections, which will be used to
     * detect dragged sections and improve detection speed.
     */
    private getBeatmapSections(): void {
        const beatmapSections: BeatmapSection[] =
            BeatmapSectionGenerator.generateSections(
                this.map,
                this.minSectionObjectCount,
                this.maxSectionDeltaTime
            );
        for (const beatmapSection of beatmapSections) {
            this.beatmapSections.push(
                new ThreeFingerBeatmapSection({
                    firstObjectIndex: beatmapSection.firstObjectIndex,
                    lastObjectIndex: beatmapSection.lastObjectIndex,
                    isDragged: false,
                    dragFingerIndex: -1,
                })
            );
        }
    }

    /**
     * Checks whether or not each beatmap sections is dragged.
     */
    private detectDragPlay(): void {
        for (let i = 0; i < this.beatmapSections.length; ++i) {
            const dragIndex: number = this.checkDrag(this.beatmapSections[i]);

            this.beatmapSections[i].dragFingerIndex = dragIndex;
            this.beatmapSections[i].isDragged = dragIndex !== -1;
        }
    }

    /**
     * Checks if a section is dragged and returns the index of the drag finger.
     *
     * If the section is not dragged, -1 will be returned.
     *
     * @param section The section to check.
     */
    private checkDrag(section: BeatmapSection): number {
        const objects: DifficultyHitObject[] = this.map.objects;
        const objectData: ReplayObjectData[] = this.data.hitObjectData;
        const isPrecise: boolean = this.map.mods.some(
            (m) => m instanceof ModPrecise
        );

        const firstObject: DifficultyHitObject =
            objects[section.firstObjectIndex];
        const lastObject: DifficultyHitObject =
            objects[section.lastObjectIndex];

        let firstObjectMinHitTime: number = firstObject.object.startTime;
        if (firstObject.object instanceof Circle) {
            switch (objectData[section.firstObjectIndex].result) {
                case hitResult.RESULT_300:
                    firstObjectMinHitTime -=
                        this.hitWindow.hitWindowFor300(isPrecise);
                    break;
                case hitResult.RESULT_100:
                    firstObjectMinHitTime -=
                        this.hitWindow.hitWindowFor100(isPrecise);
                    break;
                default:
                    firstObjectMinHitTime -=
                        this.hitWindow.hitWindowFor50(isPrecise);
            }
        } else {
            firstObjectMinHitTime -= this.hitWindow.hitWindowFor50(isPrecise);
        }

        let lastObjectMaxHitTime: number = lastObject.object.startTime;
        if (lastObject.object instanceof Circle) {
            switch (objectData[section.lastObjectIndex].result) {
                case hitResult.RESULT_300:
                    lastObjectMaxHitTime +=
                        this.hitWindow.hitWindowFor300(isPrecise);
                    break;
                case hitResult.RESULT_100:
                    lastObjectMaxHitTime +=
                        this.hitWindow.hitWindowFor100(isPrecise);
                    break;
                default:
                    lastObjectMaxHitTime +=
                        this.hitWindow.hitWindowFor50(isPrecise);
            }
        } else {
            lastObjectMaxHitTime += this.hitWindow.hitWindowFor50(isPrecise);
        }

        // Since there may be more than 1 cursor instance index,
        // we check which cursor instance follows hitobjects all over.
        const cursorIndexes: number[] = [];
        for (let i = 0; i < this.data.cursorMovement.length; ++i) {
            const c: CursorData = this.data.cursorMovement[i];
            if (c.size === 0) {
                continue;
            }

            // Do not include cursors that don't have an occurence in this section
            // this speeds up checking process.
            if (
                c.time.filter(
                    (v) =>
                        v >= firstObjectMinHitTime && v <= lastObjectMaxHitTime
                ).length === 0
            ) {
                continue;
            }

            // If this cursor instance doesn't move, it's not the cursor instance we want.
            if (c.id.filter((v) => v === movementType.MOVE).length === 0) {
                continue;
            }

            cursorIndexes.push(i);
        }

        return this.findDragIndex(
            objects.slice(
                section.firstObjectIndex,
                section.lastObjectIndex + 1
            ),
            objectData.slice(
                section.firstObjectIndex,
                section.lastObjectIndex + 1
            ),
            cursorIndexes
        );
    }

    /**
     * Finds the drag index of the section.
     *
     * @param sectionObjects The objects in the section.
     * @param sectionReplayObjectData The hitobject data of all objects in the section.
     * @param cursorIndexes The indexes of the cursor instance that has at least an occurrence in the section.
     */
    private findDragIndex(
        sectionObjects: DifficultyHitObject[],
        sectionReplayObjectData: ReplayObjectData[],
        cursorIndexes: number[]
    ): number {
        let objectIndex: number = sectionObjects.findIndex(
            (v, i) =>
                !(v.object instanceof Spinner) &&
                sectionReplayObjectData[i].result !== hitResult.RESULT_0
        );
        if (objectIndex === -1) {
            return -1;
        }

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

            // Get the cursor instance that is closest to the object's hit time.
            for (let j = 0; j < cursorIndexes.length; ++j) {
                const c: CursorData =
                    this.data.cursorMovement[cursorIndexes[j]];

                // Cursor instances aren't always recorded at all times,
                // therefore the game emulates the movement between
                // movementType.MOVE cursors.
                const hitTime: number = o.object.startTime + s.accuracy;
                const nextHitIndex: number = c.time.findIndex(
                    (v) => v >= hitTime
                );
                const hitIndex: number = nextHitIndex - 1;
                if (hitIndex <= -1) {
                    cursorIndexes[j] = -1;
                    continue;
                }
                if (c.id[hitIndex] === movementType.UP) {
                    cursorIndexes[j] = -1;
                    continue;
                }

                const cursorPosition: Vector2 = new Vector2({
                    x: c.x[hitIndex],
                    y: c.y[hitIndex],
                });

                let isInObject: boolean = false;

                if (
                    c.id[nextHitIndex] === movementType.MOVE ||
                    c.id[hitIndex] === movementType.MOVE
                ) {
                    // Try to interpolate movement between two movementType.MOVE cursor every 1ms.
                    // This minimizes rounding error.
                    for (
                        let mSecPassed = c.time[hitIndex];
                        mSecPassed <= c.time[nextHitIndex];
                        ++mSecPassed
                    ) {
                        const t: number =
                            (mSecPassed - c.time[nextHitIndex]) /
                            (c.time[hitIndex] - c.time[nextHitIndex]);
                        cursorPosition.x = Interpolation.lerp(
                            c.x[hitIndex],
                            c.x[nextHitIndex],
                            t
                        );
                        cursorPosition.y = Interpolation.lerp(
                            c.y[hitIndex],
                            c.y[nextHitIndex],
                            t
                        );

                        if (
                            o.object.stackedPosition.getDistance(
                                cursorPosition
                            ) <= o.object.radius
                        ) {
                            isInObject = true;
                            break;
                        }
                    }
                } else {
                    isInObject =
                        o.object.stackedPosition.getDistance(cursorPosition) <=
                        o.object.radius;
                }
                if (!isInObject) {
                    cursorIndexes[j] = -1;
                }
            }
            cursorIndexes = cursorIndexes.filter((v) => v !== -1);
        }

        return cursorIndexes.shift() ?? -1;
    }

    /**
     * Redivides the beatmap into sections.
     *
     * The result will be used to detect for three-fingered
     * sections.
     */
    private getDetailedBeatmapSections(): void {
        const objects: DifficultyHitObject[] = this.map.objects;
        const newBeatmapSections: ThreeFingerBeatmapSection[] = [];

        for (const beatmapSection of this.beatmapSections) {
            let inSpeedSection: boolean = false;
            let newFirstObjectIndex = beatmapSection.firstObjectIndex;

            for (
                let i = beatmapSection.firstObjectIndex;
                i <= beatmapSection.lastObjectIndex;
                ++i
            ) {
                if (
                    !inSpeedSection &&
                    objects[i].originalTapStrain >=
                        ThreeFingerChecker.strainThreshold
                ) {
                    inSpeedSection = true;
                    newFirstObjectIndex = i;
                    continue;
                }

                if (
                    inSpeedSection &&
                    objects[i].originalTapStrain <
                        ThreeFingerChecker.strainThreshold
                ) {
                    inSpeedSection = false;
                    newBeatmapSections.push({
                        firstObjectIndex: newFirstObjectIndex,
                        lastObjectIndex: i,
                        isDragged: beatmapSection.isDragged,
                        dragFingerIndex: beatmapSection.dragFingerIndex,
                    });
                }
            }

            // Don't forget to manually add the last beatmap section, which would otherwise be ignored.
            if (inSpeedSection) {
                newBeatmapSections.push({
                    firstObjectIndex: newFirstObjectIndex,
                    lastObjectIndex: beatmapSection.lastObjectIndex,
                    isDragged: beatmapSection.isDragged,
                    dragFingerIndex: beatmapSection.dragFingerIndex,
                });
            }
        }

        this.beatmapSections.length = 0;
        this.beatmapSections.push(...newBeatmapSections);
    }

    /**
     * Attempts to prevent accidental taps from being flagged.
     *
     * This detection will filter cursors that don't hit
     * any object in beatmap sections, thus eliminating any
     * unnecessary taps.
     */
    private preventAccidentalTaps(): void {
        let filledCursorAmount: number = this.downCursorInstances.filter(
            (v) => v.size > 0
        ).length;
        if (filledCursorAmount <= 3) {
            return;
        }

        const objects: DifficultyHitObject[] = this.map.objects;
        const totalCursorAmount: number = this.downCursorInstances
            .map((v) => {
                return v.size;
            })
            .reduce((acc, value) => acc + value, 0);

        for (let i = 0; i < this.downCursorInstances.length; ++i) {
            if (filledCursorAmount <= 3) {
                break;
            }
            const cursorInstance: CursorData = this.downCursorInstances[i];
            // Use an estimation for accidental tap threshold.
            if (
                cursorInstance.size <=
                    Math.ceil(objects.length / this.accidentalTapThreshold) &&
                cursorInstance.size / totalCursorAmount <
                    this.threeFingerRatioThreshold * 2
            ) {
                --filledCursorAmount;
                for (const property in cursorInstance) {
                    const prop = <keyof CursorData>property;
                    if (Array.isArray(cursorInstance[prop])) {
                        (<number[]>cursorInstance[prop]).length = 0;
                    } else {
                        (<number>cursorInstance[prop]) = 0;
                    }
                }
            }
            this.downCursorInstances[i] = cursorInstance;
        }
    }

    /**
     * Creates nerf factors by scanning through objects.
     *
     * This check will ignore all objects with speed strain below `strainThreshold`.
     */
    private calculateNerfFactors(): void {
        const objects: DifficultyHitObject[] = this.map.objects;
        const objectData: ReplayObjectData[] = this.data.hitObjectData;
        const isPrecise: boolean = this.data.convertedMods.some(
            (m) => m instanceof ModPrecise
        );

        // We only filter cursor instances that are above the strain threshold.
        // This minimalizes the amount of cursor instances to analyze.
        for (const beatmapSection of this.beatmapSections) {
            const dragIndex: number = beatmapSection.dragFingerIndex;

            const startTime: number =
                objects[beatmapSection.firstObjectIndex].object.startTime +
                (objectData[beatmapSection.firstObjectIndex].result !==
                hitResult.RESULT_0
                    ? objectData[beatmapSection.firstObjectIndex].accuracy
                    : -this.hitWindow.hitWindowFor50(isPrecise));

            const endTime: number =
                objects[beatmapSection.lastObjectIndex].object.endTime +
                (objectData[beatmapSection.lastObjectIndex].result !==
                hitResult.RESULT_0
                    ? objectData[beatmapSection.lastObjectIndex].accuracy
                    : this.hitWindow.hitWindowFor50(isPrecise));

            // Filter cursor instances during section.
            this.downCursorInstances.forEach((c) => {
                const i: number = c.time.findIndex((t) => t >= startTime);
                if (i !== -1) {
                    c.size -= i;
                    c.time.splice(0, i);
                    c.x.splice(0, i);
                    c.y.splice(0, i);
                    c.id.splice(0, i);
                }
            });
            const cursorAmounts: number[] = [];
            const cursorVectorTimes: {
                readonly vector: Vector2;
                readonly time: number;
            }[] = [];
            for (let i = 0; i < this.downCursorInstances.length; ++i) {
                // Do not include drag cursor instance.
                if (i === dragIndex) {
                    continue;
                }
                const cursorData: CursorData = this.downCursorInstances[i];
                let amount = 0;
                for (let j: number = 0; j < cursorData.size; ++j) {
                    if (
                        cursorData.time[j] >= startTime &&
                        cursorData.time[j] <= endTime
                    ) {
                        ++amount;
                        cursorVectorTimes.push({
                            vector: new Vector2({
                                x: cursorData.x[j],
                                y: cursorData.y[j],
                            }),
                            time: cursorData.time[j],
                        });
                    }
                }
                cursorAmounts.push(amount);
            }

            // This index will be used to detect if a section is 3-fingered.
            // If the section is dragged, the dragged instance will be ignored,
            // hence why the index is 1 less than nondragged section.
            const fingerSplitIndex: number = dragIndex !== -1 ? 2 : 3;

            // Divide >=4th (3rd for drag) cursor instances with 1st + 2nd (+ 3rd for nondrag)
            // to check if the section is 3-fingered.
            const threeFingerRatio: number =
                cursorAmounts
                    .slice(fingerSplitIndex)
                    .reduce((acc, value) => acc + value, 0) /
                cursorAmounts
                    .slice(0, fingerSplitIndex)
                    .reduce((acc, value) => acc + value, 0);

            const similarPresses: CursorVectorSimilarity[] = [];

            for (const cursorVectorTime of cursorVectorTimes) {
                const pressIndex: number = similarPresses.findIndex(
                    (v) =>
                        v.vector.getDistance(cursorVectorTime.vector) <=
                        this.cursorDistancingDistanceThreshold
                );

                if (pressIndex !== -1) {
                    if (
                        cursorVectorTime.time -
                            similarPresses[pressIndex].lastTime >=
                        this.cursorDistancingTimeThreshold
                    ) {
                        similarPresses.splice(pressIndex, 1);
                        similarPresses.push({
                            vector: cursorVectorTime.vector,
                            count: 1,
                            lastTime: cursorVectorTime.time,
                        });
                        continue;
                    }
                    similarPresses[pressIndex].vector = cursorVectorTime.vector;
                    similarPresses[pressIndex].lastTime = cursorVectorTime.time;
                    ++similarPresses[pressIndex].count;
                } else {
                    similarPresses.push({
                        vector: cursorVectorTime.vector,
                        count: 1,
                        lastTime: cursorVectorTime.time,
                    });
                }
            }

            // Sort by highest count; assume the order is 3rd, 4th, 5th, ... finger
            const validPresses: CursorVectorSimilarity[] = similarPresses
                .filter((v) => v.count >= this.cursorDistancingCountThreshold)
                .sort((a, b) => {
                    return b.count - a.count;
                })
                .slice(2);

            // Ignore cursor presses that are only 1 for now since they are very likely to be accidental
            if (
                (threeFingerRatio > this.threeFingerRatioThreshold &&
                    cursorAmounts.filter((v) => v > 1).length > 3) ||
                validPresses.length > 0
            ) {
                // Strain factor
                const objectCount: number =
                    beatmapSection.lastObjectIndex -
                    beatmapSection.firstObjectIndex +
                    1;
                const strainFactor: number = Math.pow(
                    objects
                        .slice(
                            beatmapSection.firstObjectIndex,
                            beatmapSection.lastObjectIndex
                        )
                        .map((v) => {
                            return v.originalTapStrain;
                        })
                        .sort((a, b) => {
                            return b - a;
                        })
                        .reduce(
                            (acc, value) =>
                                acc +
                                value / ThreeFingerChecker.strainThreshold,
                            0
                        ),
                    0.75
                );

                // We can ignore the first 3 (2 for drag) filled cursor instances
                // since they are guaranteed not 3 finger.
                const threeFingerCursorAmounts: number[] = cursorAmounts
                    .slice(fingerSplitIndex)
                    .filter((amount) => amount > 0);

                // Finger factor applies more penalty if more fingers were used.
                const fingerFactor: number =
                    threeFingerRatio > this.threeFingerRatioThreshold
                        ? threeFingerCursorAmounts.reduce(
                              (acc, value, index) =>
                                  acc +
                                  Math.pow(
                                      ((index + 1) * value * objectCount) /
                                          this.strainNoteCount,
                                      0.8
                                  ),
                              1
                          )
                        : Math.pow(
                              validPresses.reduce(
                                  (acc, value, index) =>
                                      acc +
                                      Math.pow(
                                          ((index + 1) *
                                              (value.count /
                                                  (this
                                                      .cursorDistancingCountThreshold *
                                                      2)) *
                                              objectCount) /
                                              this.strainNoteCount,
                                          0.2
                                      ),
                                  1
                              ),
                              0.2
                          );

                // Length factor applies more penalty if there are more 3-fingered object.
                const lengthFactor: number =
                    1 + Math.pow(objectCount / this.strainNoteCount, 1.2);

                this.nerfFactors.push({
                    strainFactor: Math.max(1, strainFactor),
                    fingerFactor,
                    lengthFactor,
                });
            }
        }
    }

    /**
     * Calculates the final penalty.
     */
    private calculateFinalPenalty(): number {
        return (
            1 +
            this.nerfFactors.reduce(
                (a, n) =>
                    a +
                    0.015 *
                        Math.pow(
                            n.strainFactor * n.fingerFactor * n.lengthFactor,
                            1.05
                        ),
                0
            )
        );
    }
}
