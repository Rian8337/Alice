import {
    Beatmap,
    BeatmapMetadata,
    DroidHitWindow,
    Interpolation,
    MapStats,
    Modes,
    ModHardRock,
    ModPrecise,
    ModUtil,
    PlaceableHitObject,
    Spinner,
    Utils,
    Vector2,
} from "@rian8337/osu-base";
import {
    CursorData,
    CursorOccurrence,
    CursorOccurrenceGroup,
    HitResult,
    MovementType,
    ReplayData,
    ReplayObjectData,
} from "@rian8337/osu-droid-replay-analyzer";
import { MissInformation } from "./MissInformation";

/**
 * An analyzer for analyzing misses in a replay.
 */
export class MissAnalyzer {
    /**
     * The beatmap metadata played in the replay.
     */
    private readonly beatmapMetadata: BeatmapMetadata;

    /**
     * The objects of the beatmap played in the replay.
     */
    private readonly objects: readonly PlaceableHitObject[];

    /**
     * The true scale of objects.
     */
    private readonly trueObjectScale: number;

    /**
     * The data of the replay.
     */
    private readonly data: ReplayData;

    /**
     * Approach rate converted to milliseconds.
     */
    private readonly approachRateTime: number;

    /**
     * The hit window 50 of the replay.
     */
    private readonly hitWindow50: number;

    /**
     * @param difficultyCalculator The difficulty calculator result of the replay.
     * @param data The data of the replay.
     */
    constructor(beatmap: Beatmap, data: ReplayData) {
        this.beatmapMetadata = beatmap.metadata;
        this.objects = beatmap.hitObjects.objects;
        this.data = data;

        const circleSize: number = new MapStats({
            cs: beatmap.difficulty.cs,
            mods: data.convertedMods,
        }).calculate({ mode: Modes.droid }).cs!;
        this.trueObjectScale = (1 - (0.7 * (circleSize - 5)) / 5) / 2;

        const stats: MapStats = new MapStats({
            ar: beatmap.difficulty.ar,
            od: beatmap.difficulty.od,
            mods: data.convertedMods.filter(
                (m) =>
                    m.isApplicableToDroid() &&
                    !ModUtil.speedChangingMods.some(
                        (v) => v.acronym === m.acronym
                    ) &&
                    !(m instanceof ModPrecise)
            ),
        }).calculate();

        this.hitWindow50 = new DroidHitWindow(stats.od!).hitWindowFor50(
            data.convertedMods.some((m) => m instanceof ModPrecise)
        );
        this.approachRateTime = MapStats.arToMS(stats.ar!);
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
            const object: PlaceableHitObject = this.objects[objectIndex];
            const previousObjects: PlaceableHitObject[] = [];
            const previousHitResults: HitResult[] = [];

            for (let i = objectIndex - 1; i >= 0; --i) {
                const o: PlaceableHitObject = this.objects[i];
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
                this.beatmapMetadata,
                this.objects[objectIndex],
                this.trueObjectScale,
                objectIndex,
                this.objects.length,
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

            if (objectData.result !== HitResult.miss) {
                continue;
            }

            const object: PlaceableHitObject = this.objects[i];

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
                        i > 0 &&
                            this.data.hitObjectData[i - 1].result ===
                                HitResult.miss
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
        object: PlaceableHitObject,
        cursorIndex: number,
        includeNotelockVerdict: boolean
    ): { position: Vector2; closestHit: number; verdict: string } | null {
        if (object.droidScale !== this.trueObjectScale) {
            // Deep clone the object so that we can assign scale properly.
            object = Utils.deepCopy(object);
            object.droidScale = this.trueObjectScale;
        }

        const cursorData: CursorData = this.data.cursorMovement[cursorIndex];

        // Limit to cursor occurrences within this distance.
        // Add a cap to better assess smaller objects.
        let closestDistance: number = Math.max(
            2.5 * object.getRadius(Modes.droid),
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
                return distance > object.getRadius(Modes.droid);
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

                if (occurrence.id === MovementType.down) {
                    const distanceToObject: number = object
                        .getStackedPosition(Modes.droid)
                        .getDistance(occurrence.position);

                    if (acceptDistance(distanceToObject)) {
                        closestDistance = distanceToObject;
                        closestCursorPosition = occurrence.position;
                        closestHit = occurrence.time - object.startTime;
                    }
                }

                const nextOccurrence: CursorOccurrence = allOccurrences[i + 1];

                if (nextOccurrence?.id === MovementType.move) {
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
                                .getStackedPosition(Modes.droid)
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
        if (closestDistance <= object.getRadius(Modes.droid)) {
            verdict = "Notelock";
        }

        return {
            position: closestCursorPosition,
            closestHit: closestHit,
            verdict: verdict,
        };
    }
}
