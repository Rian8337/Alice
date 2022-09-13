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
     * @param missLimit The amount of misses to analyze. Defaults to 5.
     * @returns Information about misses.
     */
    analyze(missLimit: number = 5): MissInformation[] {
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
            verdict: string,
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

                // An object's fade time is 400ms.
                if (timeDifference >= this.approachRateTime + 400) {
                    break;
                }

                previousObjects.push(o);
                previousHitResults.push(this.data.hitObjectData[i].result);
            }

            return new MissInformation(
                this.beatmap.metadata,
                this.beatmap.hitObjects.objects[objectIndex],
                objectIndex,
                this.beatmap.hitObjects.objects.length,
                missIndex++,
                this.data.accuracy.nmiss,
                verdict,
                stats.speedMultiplier,
                flipObjects,
                previousObjects.reverse(),
                previousHitResults.reverse(),
                cursorPosition,
                closestHit
            );
        };

        for (let i = 0; i < this.data.hitObjectData.length; ++i) {
            if (missIndex === missLimit) {
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
            let closestDistance: number = Number.POSITIVE_INFINITY;
            let closestHit: number = Number.POSITIVE_INFINITY;
            let closestCursorPosition: Vector2 | null = null;
            let verdict: string | null = null;

            for (let j = 0; j < this.data.cursorMovement.length; ++j) {
                const cursorOccurrenceInfo =
                    this.getCursorOccurrenceClosestToObject(object, j);

                if (cursorOccurrenceInfo === null) {
                    continue;
                }

                const distanceToObject: number = object
                    .getStackedPosition(modes.droid)
                    .getDistance(cursorOccurrenceInfo.position);

                if (closestDistance > distanceToObject) {
                    closestDistance = distanceToObject;
                    closestCursorPosition = cursorOccurrenceInfo.position;
                    closestHit = cursorOccurrenceInfo.closestHit;
                    verdict = cursorOccurrenceInfo.verdict;
                }
            }

            if (closestCursorPosition === null || verdict === null) {
                missInformations.push(
                    createMissInformation(i, "Didn't try to hit")
                );

                continue;
            }

            missInformations.push(
                createMissInformation(
                    i,
                    verdict,
                    closestCursorPosition,
                    closestHit
                )
            );
        }

        return missInformations;
    }

    /**
     * Gets the cursor occurrence index at which the cursor has the closest distance to an object.
     *
     * @param object The object.
     * @param cursorIndex The index of the cursor instance.
     * @returns The cursor occurrence information from the cursor instance at which
     * the cursor is the closest to the object, `null` if not found.
     */
    private getCursorOccurrenceClosestToObject(
        object: HitObject,
        cursorIndex: number
    ): { position: Vector2; closestHit: number; verdict: string } | null {
        const cursorData: CursorData = this.data.cursorMovement[cursorIndex];
        let closestDistance: number = Number.POSITIVE_INFINITY;
        let closestHit: number = Number.POSITIVE_INFINITY;
        let closestCursorPosition: Vector2 | null = null;
        let verdict: string | null = null;

        for (let i = 0; i < cursorData.occurrences.length; ++i) {
            const occurrence: CursorOccurrence = cursorData.occurrences[i];

            if (occurrence.id === movementType.UP) {
                continue;
            }

            const timeDifference: number = occurrence.time - object.startTime;

            // Only count cursor occurrences within an object's approach time or hit window.
            // An object's fade time is 400ms.
            if (timeDifference < -this.approachRateTime - 400) {
                continue;
            }

            // Employ an additional 100ms window in case the player tapped too late.
            if (timeDifference > this.hitWindow50 + 100) {
                break;
            }

            const nextOccurrence: CursorOccurrence =
                cursorData.occurrences[i + 1];

            if (nextOccurrence?.id === movementType.MOVE) {
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

                        const distanceToObject: number = object
                            .getStackedPosition(modes.droid)
                            .getDistance(cursorPosition);

                        if (closestDistance > distanceToObject) {
                            closestDistance = distanceToObject;
                            closestCursorPosition = cursorPosition;
                            closestHit = o.time - object.startTime;
                        }
                    }
                }
            } else {
                // At this point, the next occurrence's move type is `movementType.UP`.
                // This is because the current occurrence's move type will never be `movementType.UP`.
                const distanceToObject: number = object
                    .getStackedPosition(modes.droid)
                    .getDistance(occurrence.position);

                if (closestDistance > distanceToObject) {
                    closestDistance = distanceToObject;
                    closestCursorPosition = occurrence.position;
                    closestHit = occurrence.time - object.startTime;
                }
            }
        }

        if (closestCursorPosition === null) {
            return null;
        }

        const distanceToObject: number = object
            .getStackedPosition(modes.droid)
            .getDistance(closestCursorPosition);

        if (Math.abs(closestHit) < this.hitWindow50) {
            if (distanceToObject <= object.getRadius(modes.droid)) {
                verdict = "Notelock";
            } else {
                verdict = "Misaim";
            }
        } else if (closestHit < 0) {
            verdict = "Tapped too early";
        } else {
            verdict = "Tapped too late";
        }

        return {
            position: closestCursorPosition,
            closestHit: closestHit,
            verdict: verdict,
        };
    }
}
