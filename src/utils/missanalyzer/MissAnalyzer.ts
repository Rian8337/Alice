import {
    Beatmap,
    DroidHitWindow,
    HitObject,
    Interpolation,
    MapStats,
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
     * @returns Information about misses.
     */
    analyze(): MissInformation[] {
        if (this.data.accuracy.nmiss === 0) {
            return [];
        }

        let missIndex: number = 0;
        const missInformations: MissInformation[] = [];

        const createMissInformation = (
            objectIndex: number,
            verdict: string,
            occurrence?: CursorOccurrence,
            closestDistance?: number
        ): MissInformation => {
            return new MissInformation(
                this.beatmap.metadata,
                this.beatmap.hitObjects.objects[objectIndex],
                objectIndex,
                this.beatmap.hitObjects.objects.length,
                missIndex++,
                this.data.accuracy.nmiss,
                verdict,
                occurrence,
                closestDistance
            );
        };

        for (let i = 0; i < this.data.hitObjectData.length; ++i) {
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
            let closestDistance: number = Number.POSITIVE_INFINITY;
            let closestCursorOccurrence: CursorOccurrence | null = null;

            for (let j = 0; j < this.data.cursorMovement.length; ++j) {
                const cursorOccurrenceInfo =
                    this.getCursorOccurrenceClosestToObject(object, j);

                if (cursorOccurrenceInfo === null) {
                    continue;
                }

                if (closestDistance > cursorOccurrenceInfo.closestDistance) {
                    closestDistance = cursorOccurrenceInfo.closestDistance;
                    closestCursorOccurrence =
                        this.data.cursorMovement[j].occurrences[
                            cursorOccurrenceInfo.index
                        ];
                }

                closestDistance = Math.min(
                    closestDistance,
                    cursorOccurrenceInfo.closestDistance
                );
            }

            if (
                closestCursorOccurrence === null ||
                closestDistance === Number.POSITIVE_INFINITY
            ) {
                missInformations.push(
                    createMissInformation(i, "Didn't try to hit")
                );

                continue;
            }

            const distanceOutsideObject: number =
                closestDistance - object.radius;

            if (distanceOutsideObject <= 0) {
                missInformations.push(
                    createMissInformation(i, "Notelock", closestCursorOccurrence, closestDistance)
                );
            } else if (distanceOutsideObject <= 50) {
                missInformations.push(
                    createMissInformation(
                        i,
                        "Misaim",
                        closestCursorOccurrence,
                        distanceOutsideObject
                    )
                );
            } else {
                missInformations.push(
                    createMissInformation(i, "Misaim/didn't try to hit", closestCursorOccurrence, closestDistance)
                );
            }
        }

        return missInformations;
    }

    /**
     * Gets the cursor occurrence index at which the cursor has the closest distance to an object.
     *
     * @param object The object.
     * @param cursorIndex The index of the cursor instance.
     * @returns The cursor occurrence index in the cursor instance at which
     * the cursor is the closest to the object, `null` if not found.
     */
    private getCursorOccurrenceClosestToObject(
        object: HitObject,
        cursorIndex: number
    ): { index: number; closestDistance: number } | null {
        const cursorData: CursorData = this.data.cursorMovement[cursorIndex];
        let closestDistance: number = Number.POSITIVE_INFINITY;
        let closestOccurrenceIndex: number | null = null;

        for (let i = 0; i < cursorData.occurrences.length; ++i) {
            const occurrence: CursorOccurrence = cursorData.occurrences[i];

            if (occurrence.id === movementType.UP) {
                continue;
            }

            const timeDifference: number = occurrence.time - object.startTime;

            // Only count cursor occurrences within an object's approach time.
            if (timeDifference < -this.approachRateTime) {
                continue;
            }

            if (timeDifference > this.approachRateTime) {
                break;
            }

            const nextOccurrence: CursorOccurrence =
                cursorData.occurrences[i + 1];

            if (
                occurrence.id === movementType.MOVE &&
                // This is guaranteed to exist if the current occurrence is movementType.MOVE.
                nextOccurrence.id === movementType.MOVE
            ) {
                // Check if other cursor instances have a tap occurrence within both occurrences' boundary.
                for (let j = 0; j < this.data.cursorMovement.length; ++j) {
                    // Do not check the current cursor instance in loop.
                    if (j === cursorIndex) {
                        continue;
                    }

                    const { occurrences } = this.data.cursorMovement[j];

                    for (const o of occurrences) {
                        if (o.id !== movementType.DOWN) {
                            continue;
                        }

                        if (
                            o.time < occurrence.time ||
                            o.time - object.startTime <
                                -this.hitWindow.hitWindowFor50(this.isPrecise)
                        ) {
                            continue;
                        }

                        if (
                            o.time > nextOccurrence.time ||
                            o.time - object.startTime >
                                this.hitWindow.hitWindowFor50(this.isPrecise)
                        ) {
                            break;
                        }

                        const t: number =
                            (o.time - occurrence.time) /
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

                        const distanceToObject: number =
                            object.stackedPosition.getDistance(cursorPosition);

                        if (closestDistance > distanceToObject) {
                            closestDistance = distanceToObject;
                            closestOccurrenceIndex = i;
                        }
                    }
                }
            } else {
                closestDistance = Math.min(
                    closestDistance,
                    object.stackedPosition.getDistance(occurrence.position)
                );
            }
        }

        if (
            closestOccurrenceIndex === null ||
            closestDistance === Number.POSITIVE_INFINITY
        ) {
            return null;
        }

        return {
            index: closestOccurrenceIndex,
            closestDistance: closestDistance,
        };
    }
}
