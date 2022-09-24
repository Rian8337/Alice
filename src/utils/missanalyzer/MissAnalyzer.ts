import {
    Beatmap,
    DroidHitWindow,
    HitObject,
    Interpolation,
    MapStats,
    modes,
    ModHardRock,
    ModPrecise,
    ModUtil,
    Spinner,
    Vector2,
} from "@rian8337/osu-base";
import { DroidDifficultyCalculator } from "@rian8337/osu-difficulty-calculator";
import { DroidDifficultyCalculator as RebalanceDroidDifficultyCalculator } from "@rian8337/osu-rebalance-difficulty-calculator";
import {
    CursorData,
    CursorOccurrence,
    CursorOccurrenceGroup,
    hitResult,
    movementType,
    ReplayData,
    ReplayObjectData,
} from "@rian8337/osu-droid-replay-analyzer";
import { MissInformation } from "./MissInformation";

/**
 * An analyzer for analyzing misses in a replay.
 */
export class MissAnalyzer {
    /**
     * The beatmap played in the replay.
     */
    private readonly beatmap: Beatmap;

    /**
     * The data of the replay.
     */
    private readonly data: ReplayData;

    /**
     * The hit window of the beatmap.
     */
    private readonly hitWindow: DroidHitWindow;

    /**
     * Approach rate converted to milliseconds.
     */
    private readonly approachRateTime: number;

    /**
     * Whether the Precise mod was used.
     */
    private readonly isPrecise: boolean;

    private get hitWindow50(): number {
        return this.hitWindow.hitWindowFor50(this.isPrecise);
    }

    /**
     * @param difficultyCalculator The difficulty calculator result of the replay.
     * @param data The data of the replay.
     */
    constructor(
        difficultyCalculator:
            | DroidDifficultyCalculator
            | RebalanceDroidDifficultyCalculator,
        data: ReplayData
    ) {
        this.beatmap = difficultyCalculator.beatmap;
        this.data = data;

        const stats: MapStats = new MapStats({
            ar: this.beatmap.difficulty.ar,
            od: this.beatmap.difficulty.od,
            mods: data.convertedMods.filter(
                (m) =>
                    m.isApplicableToDroid() &&
                    !ModUtil.speedChangingMods.some(
                        (v) => v.acronym === m.acronym
                    ) &&
                    !(m instanceof ModPrecise)
            ),
        }).calculate();

        this.hitWindow = new DroidHitWindow(stats.od!);
        this.approachRateTime = MapStats.arToMS(stats.ar!);
        this.isPrecise = data.convertedMods.some(
            (m) => m instanceof ModPrecise
        );
    }

    /**
     * Analyzes the replay for miss informations.
     *
     * @param missLimit The amount of misses to analyze. Defaults to 10.
     * @returns Information about misses.
     */
    analyze(missLimit: number = 10): MissInformation[] {
        if (this.data.accuracy.nmiss === 0) {
            return [];
        }

        let missIndex: number = 0;
        const missInformations: MissInformation[] = [];

        const stats: MapStats = new MapStats({
            speedMultiplier: this.data.speedModification,
            mods: this.data.convertedMods,
        }).calculate();
        const flipObjects: boolean = this.data.convertedMods.some(
            (m) => m instanceof ModHardRock
        );

        const createMissInformation = (
            objectIndex: number,
            verdict?: string,
            cursorPosition?: Vector2,
            closestHit?: number
        ): MissInformation => {
            const object: HitObject =
                this.beatmap.hitObjects.objects[objectIndex];
            const previousObjects: HitObject[] = [];
            const previousHitResults: hitResult[] = [];

            for (let i = objectIndex - 1; i >= 0; --i) {
                const o: HitObject = this.beatmap.hitObjects.objects[i];
                const timeDifference: number = object.startTime - o.startTime;

                if (timeDifference >= this.approachRateTime) {
                    break;
                }

                previousObjects.push(o);
                previousHitResults.push(this.data.hitObjectData[i].result);
            }

            const cursorGroups: CursorOccurrenceGroup[][] = [];
            const minCursorGroupAllowableTime: number =
                object.startTime - this.approachRateTime;
            const maxCursorGroupAllowableTime: number = object.endTime + 250;

            for (const cursorData of this.data.cursorMovement) {
                const c: CursorOccurrenceGroup[] = [];

                for (const group of cursorData.occurrenceGroups) {
                    if (group.endTime < minCursorGroupAllowableTime) {
                        continue;
                    }

                    if (group.startTime > maxCursorGroupAllowableTime) {
                        break;
                    }

                    c.push(group);
                }

                cursorGroups.push(c);
            }

            return new MissInformation(
                this.beatmap.metadata,
                this.beatmap.hitObjects.objects[objectIndex],
                objectIndex,
                this.beatmap.hitObjects.objects.length,
                missIndex++,
                this.data.accuracy.nmiss,
                stats.speedMultiplier,
                flipObjects,
                previousObjects.reverse(),
                previousHitResults.reverse(),
                cursorGroups,
                this.approachRateTime,
                verdict,
                cursorPosition,
                closestHit
            );
        };

        for (let i = 0; i < this.data.hitObjectData.length; ++i) {
            if (
                missIndex === missLimit ||
                missIndex === this.data.accuracy.nmiss
            ) {
                break;
            }

            const objectData: ReplayObjectData = this.data.hitObjectData[i];

            if (objectData.result !== hitResult.RESULT_0) {
                continue;
            }

            const object: HitObject = this.beatmap.hitObjects.objects[i];

            if (object instanceof Spinner) {
                // Spinner misses are simple. They just didn't spin enough.
                missInformations.push(
                    createMissInformation(i, "Didn't spin enough")
                );

                continue;
            }

            // Find the cursor instance with the closest tap/drag occurrence to the object.
            let closestHit: number = Number.POSITIVE_INFINITY;
            let closestCursorPosition: Vector2 | null = null;
            let verdict: string | null = null;

            for (let j = 0; j < this.data.cursorMovement.length; ++j) {
                const cursorOccurrenceInfo =
                    this.getCursorOccurrenceClosestToObject(
                        object,
                        j,
                        i > 0
                            ? this.data.hitObjectData[i - 1].result ===
                                  hitResult.RESULT_0
                            : false
                    );

                if (cursorOccurrenceInfo === null) {
                    continue;
                }

                if (
                    Math.abs(cursorOccurrenceInfo.closestHit) <
                        this.hitWindow50 &&
                    Math.abs(cursorOccurrenceInfo.closestHit) <
                        Math.abs(closestHit)
                ) {
                    closestCursorPosition = cursorOccurrenceInfo.position;
                    closestHit = cursorOccurrenceInfo.closestHit;
                    verdict = cursorOccurrenceInfo.verdict;
                }
            }

            if (closestCursorPosition && verdict !== null) {
                missInformations.push(
                    createMissInformation(
                        i,
                        verdict,
                        closestCursorPosition,
                        closestHit
                    )
                );
            } else {
                missInformations.push(createMissInformation(i));
            }
        }

        return missInformations;
    }

    /**
     * Gets the cursor occurrence index at which the cursor has the closest distance to an object.
     *
     * @param object The object.
     * @param cursorIndex The index of the cursor instance.
     * @param includeNotelockVerdict Whether to allow the notelock verdict.
     * @returns The cursor occurrence information from the cursor instance at which
     * the cursor is the closest to the object, `null` if not found.
     */
    private getCursorOccurrenceClosestToObject(
        object: HitObject,
        cursorIndex: number,
        includeNotelockVerdict: boolean
    ): { position: Vector2; closestHit: number; verdict: string } | null {
        const cursorData: CursorData = this.data.cursorMovement[cursorIndex];

        // Limit to cursor occurrences within this distance.
        // Add a cap to better assess smaller objects.
        let closestDistance: number = Math.max(
            2.5 * object.getRadius(modes.droid),
            80
        );
        let closestHit: number = Number.POSITIVE_INFINITY;
        let closestCursorPosition: Vector2 | null = null;

        const minAllowableTapTime: number = object.startTime - this.hitWindow50;
        const maxAllowableTapTime: number = object.startTime + this.hitWindow50;

        const acceptDistance = (distance: number): boolean => {
            if (distance > closestDistance) {
                return false;
            }

            if (!includeNotelockVerdict) {
                return distance > object.getRadius(modes.droid);
            }

            return true;
        };

        for (const group of cursorData.occurrenceGroups) {
            if (group.startTime < minAllowableTapTime) {
                continue;
            }

            if (group.startTime > maxAllowableTapTime) {
                break;
            }

            const { allOccurrences } = group;

            // Don't include the cursor up occurrence.
            if (group.up) {
                allOccurrences.pop();
            }

            for (let i = 0; i < allOccurrences.length; ++i) {
                const occurrence: CursorOccurrence = allOccurrences[i];

                if (occurrence.time > maxAllowableTapTime) {
                    break;
                }

                if (occurrence.id === movementType.DOWN) {
                    const distanceToObject: number = object
                        .getStackedPosition(modes.droid)
                        .getDistance(occurrence.position);

                    if (acceptDistance(distanceToObject)) {
                        closestDistance = distanceToObject;
                        closestCursorPosition = occurrence.position;
                        closestHit = occurrence.time - object.startTime;
                    }
                }

                const nextOccurrence: CursorOccurrence = allOccurrences[i + 1];

                if (nextOccurrence?.id === movementType.MOVE) {
                    // Check if other cursor instances have a tap occurrence within both occurrences' boundary.
                    for (let j = 0; j < this.data.cursorMovement.length; ++j) {
                        // Do not check the current cursor instance in loop.
                        if (j === cursorIndex) {
                            continue;
                        }

                        const { occurrenceGroups } =
                            this.data.cursorMovement[j];

                        for (const cursorGroup of occurrenceGroups) {
                            const cursorDownTime: number =
                                cursorGroup.down.time;

                            if (cursorDownTime < minAllowableTapTime) {
                                continue;
                            }

                            if (cursorDownTime > maxAllowableTapTime) {
                                break;
                            }

                            const t: number =
                                (cursorDownTime - occurrence.time) /
                                (nextOccurrence.time - occurrence.time);

                            const cursorPosition: Vector2 = new Vector2(
                                Interpolation.lerp(
                                    occurrence.position.x,
                                    nextOccurrence.position.x,
                                    t
                                ),
                                Interpolation.lerp(
                                    occurrence.position.y,
                                    nextOccurrence.position.y,
                                    t
                                )
                            );

                            const distanceToObject: number = object
                                .getStackedPosition(modes.droid)
                                .getDistance(cursorPosition);

                            if (acceptDistance(distanceToObject)) {
                                closestDistance = distanceToObject;
                                closestCursorPosition = cursorPosition;
                                closestHit = cursorDownTime - object.startTime;
                            }
                        }
                    }
                }
            }
        }

        if (closestCursorPosition === null) {
            return null;
        }

        let verdict: string = "Misaim";
        if (closestDistance <= object.getRadius(modes.droid)) {
            verdict = "Notelock";
        }

        return {
            position: closestCursorPosition,
            closestHit: closestHit,
            verdict: verdict,
        };
    }
}
