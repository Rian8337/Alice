import {
    Beatmap,
    DroidHitWindow,
    IModApplicableToDroid,
    Interpolation,
    Mod,
    Modes,
    ModHardRock,
    ModPrecise,
    ModUtil,
    PlaceableHitObject,
    Spinner,
    Vector2,
} from "@rian8337/osu-base";
import {
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
     * The beatmap played in the replay.
     */
    private readonly beatmap: Beatmap;

    /**
     * The objects of the beatmap played in the replay.
     */
    private readonly objects: readonly PlaceableHitObject[];

    /**
     * The data of the replay.
     */
    private readonly data: ReplayData;

    /**
     * The mods used in the replay.
     */
    private readonly mods: (Mod & IModApplicableToDroid)[];

    /**
     * The hit window of the replay.
     */
    private readonly hitWindow: DroidHitWindow;

    /**
     * The hit window 50 of the replay.
     */
    private readonly hitWindow50: number;

    /**
     * Whether the Precise mod was used.
     */
    private readonly isPrecise: boolean;

    /**
     * The speed multiplier of the beatmap.
     */
    private readonly overallSpeedMultiplier: number;

    /**
     * @param difficultyCalculator The difficulty calculator result of the replay.
     * @param data The data of the replay.
     * @param mods The mods applied in the replay. Used for old replay versions.
     */
    constructor(
        beatmap: Beatmap,
        data: ReplayData,
        mods: (Mod & IModApplicableToDroid)[],
    ) {
        const customSpeedMultiplier = data.isReplayV4()
            ? data.speedMultiplier
            : 1;

        this.beatmap = beatmap.createPlayableBeatmap({
            mode: Modes.droid,
            mods: mods,
            customSpeedMultiplier: customSpeedMultiplier,
        });

        this.objects = this.beatmap.hitObjects.objects;
        this.data = data;
        this.mods = mods;

        this.isPrecise = mods.some((m) => m instanceof ModPrecise);
        this.hitWindow = new DroidHitWindow(this.beatmap.difficulty.od);
        this.hitWindow50 = this.hitWindow.hitWindowFor50(this.isPrecise);

        this.overallSpeedMultiplier =
            ModUtil.calculateRateWithMods(mods) * customSpeedMultiplier;
    }

    /**
     * Analyzes the replay for miss informations.
     *
     * @param missLimit The amount of misses to analyze. Defaults to 10.
     * @returns Information about misses.
     */
    analyze(missLimit = 10): MissInformation[] {
        if (this.data.accuracy.nmiss === 0) {
            return [];
        }

        let missIndex = 0;
        const missInformations: MissInformation[] = [];

        const isHardRock = this.mods.some((m) => m instanceof ModHardRock);

        const createMissInformation = (
            objectIndex: number,
            verdict?: string,
            cursorPosition?: Vector2,
            closestHit?: number,
        ): MissInformation => {
            const object = this.objects[objectIndex];
            const previousObjects: PlaceableHitObject[] = [];
            const previousObjectData: ReplayObjectData[] = [];

            for (let i = objectIndex - 1; i >= 0; --i) {
                const o = this.objects[i];
                const timeDifference = object.startTime - o.startTime;

                if (timeDifference >= object.timePreempt) {
                    break;
                }

                previousObjects.push(o);
                previousObjectData.push(this.data.hitObjectData[i]);
            }

            const cursorGroups: CursorOccurrenceGroup[][] = [];
            const minCursorGroupAllowableTime =
                object.startTime - object.timePreempt;
            const maxCursorGroupAllowableTime = object.endTime + 250;

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
                this.objects[objectIndex],
                objectIndex,
                this.objects.length,
                missIndex++,
                this.data.accuracy.nmiss,
                this.overallSpeedMultiplier,
                isHardRock,
                previousObjects.reverse(),
                previousObjectData.reverse(),
                cursorGroups,
                this.hitWindow,
                this.isPrecise,
                verdict,
                cursorPosition,
                closestHit,
            );
        };

        for (let i = 0; i < this.data.hitObjectData.length; ++i) {
            if (
                missIndex === missLimit ||
                missIndex === this.data.accuracy.nmiss
            ) {
                break;
            }

            const objectData = this.data.hitObjectData[i];

            if (objectData.result !== HitResult.miss) {
                continue;
            }

            const object = this.objects[i];

            if (object instanceof Spinner) {
                // Spinner misses are simple. They just didn't spin enough.
                missInformations.push(
                    createMissInformation(i, "Didn't spin enough"),
                );

                continue;
            }

            // Find the cursor instance with the closest tap/drag occurrence to the object.
            let closestHit = Number.POSITIVE_INFINITY;
            let closestCursorPosition: Vector2 | null = null;
            let verdict: string | null = null;

            for (let j = 0; j < this.data.cursorMovement.length; ++j) {
                const cursorOccurrenceInfo =
                    this.getCursorOccurrenceClosestToObject(
                        object,
                        j,
                        i > 0 &&
                            this.data.hitObjectData[i - 1].result ===
                                HitResult.miss,
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
                        closestHit,
                    ),
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
        includeNotelockVerdict: boolean,
    ): { position: Vector2; closestHit: number; verdict: string } | null {
        const cursorData = this.data.cursorMovement[cursorIndex];

        // Limit to cursor occurrences within this distance.
        // Add a cap to better assess smaller objects.
        let closestDistance = Math.max(2.5 * object.radius, 80);
        let closestHit = Number.POSITIVE_INFINITY;
        let closestCursorPosition: Vector2 | null = null;

        const minAllowableTapTime = object.startTime - this.hitWindow50;
        const maxAllowableTapTime = object.startTime + this.hitWindow50;

        const acceptDistance = (distance: number): boolean => {
            if (distance > closestDistance) {
                return false;
            }

            if (!includeNotelockVerdict) {
                return distance > object.radius;
            }

            return true;
        };

        for (const group of cursorData.occurrenceGroups) {
            if (group.endTime < minAllowableTapTime) {
                continue;
            }

            if (group.startTime > maxAllowableTapTime) {
                break;
            }

            const { allOccurrences } = group;

            for (let i = 0; i < allOccurrences.length; ++i) {
                const occurrence = allOccurrences[i];

                if (
                    occurrence.time > maxAllowableTapTime ||
                    occurrence.id === MovementType.up
                ) {
                    break;
                }

                if (occurrence.id === MovementType.down) {
                    const distanceToObject = object
                        .getStackedPosition(Modes.droid)
                        .getDistance(occurrence.position);

                    if (acceptDistance(distanceToObject)) {
                        closestDistance = distanceToObject;
                        closestCursorPosition = occurrence.position;
                        closestHit = occurrence.time - object.startTime;
                    }
                }

                const nextOccurrence = allOccurrences[i + 1];

                if (nextOccurrence) {
                    // Check if other cursor instances have a tap occurrence within both occurrences' boundary.
                    for (let j = 0; j < this.data.cursorMovement.length; ++j) {
                        // Do not check the current cursor instance in loop.
                        if (j === cursorIndex) {
                            continue;
                        }

                        const { occurrenceGroups } =
                            this.data.cursorMovement[j];

                        for (const cursorGroup of occurrenceGroups) {
                            const cursorDownTime = cursorGroup.down.time;

                            if (cursorDownTime < minAllowableTapTime) {
                                continue;
                            }

                            if (cursorDownTime > maxAllowableTapTime) {
                                break;
                            }

                            const t =
                                (cursorDownTime - occurrence.time) /
                                (nextOccurrence.time - occurrence.time);

                            const cursorPosition =
                                nextOccurrence.id === MovementType.move
                                    ? new Vector2(
                                          Interpolation.lerp(
                                              occurrence.position.x,
                                              nextOccurrence.position.x,
                                              t,
                                          ),
                                          Interpolation.lerp(
                                              occurrence.position.y,
                                              nextOccurrence.position.y,
                                              t,
                                          ),
                                      )
                                    : occurrence.position;

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

        let verdict = "Misaim";
        if (closestDistance <= object.radius) {
            verdict = "Notelock";
        }

        return {
            position: closestCursorPosition,
            closestHit: closestHit,
            verdict: verdict,
        };
    }
}
