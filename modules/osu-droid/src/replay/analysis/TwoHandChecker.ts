import { Vector2 } from "../../mathutil/Vector2";
import { DifficultyHitObject } from "../../beatmap/hitobjects/DifficultyHitObject";
import { Spinner } from "../../beatmap/hitobjects/Spinner";
import { hitResult } from "../../constants/hitResult";
import { modes } from "../../constants/modes";
import { movementType } from "../../constants/movementType";
import { StarRating } from "../../difficulty/StarRating";
import { DroidHitWindow } from "../../utils/HitWindow";
import { MapStats } from "../../utils/MapStats";
import { mods } from "../../utils/mods";
import { CursorData } from "./../data/CursorData";
import { ReplayData } from "./../data/ReplayData";
import { ReplayObjectData } from "./../data/ReplayObjectData";
import { IndexedHitObject } from "./objects/IndexedHitObject";
import { Beatmap } from "../../beatmap/Beatmap";
import { Utils } from "../../utils/Utils";

/**
 * Utility to check whether or not a beatmap is two-handed.
 */
export class TwoHandChecker {
    /**
     * The beatmap that is being analyzed.
     */
    readonly map: StarRating;

    /**
     * The data of the replay.
     */
    readonly data: ReplayData;

    /**
     * A cursor data array that only contains `movementType.DOWN` and `movementType.MOVE` movement ID occurrences.
     */
    private readonly downMoveCursorInstances: CursorData[] = [];

    /**
     * The hitobjects of the beatmap that have been assigned with their respective cursor index.
     */
    private readonly indexedHitObjects: IndexedHitObject[] = [];

    /**
     * The osu!droid hitwindow of the analyzed beatmap.
     */
    private readonly hitWindow: DroidHitWindow;

    /**
     * @param map The beatmap to analyze.
     * @param data The data of the replay.
     */
    constructor(map: StarRating, data: ReplayData) {
        this.map = map;
        this.data = data;

        const speedModRegex: RegExp = new RegExp(`[${mods.droidMods.dt}${mods.droidMods.nc}${mods.droidMods.ht}${mods.droidMods.su}]`, "g");
        const droidModNoSpeedMod: string = mods.pcToDroid(this.map.mods).replace(speedModRegex, "");
        const stats: MapStats = new MapStats({od: this.map.map.od, mods: mods.droidToPC(droidModNoSpeedMod)}).calculate({mode: modes.droid});
        
        this.hitWindow = new DroidHitWindow(<number> stats.od);
    }

    /**
     * Checks if a beatmap is two-handed.
     */
    check(): boolean {
        this.filterCursorInstances();

        if (this.downMoveCursorInstances.filter(v => v.size > 0).length <= 1) {
            return false;
        }

        this.indexHitObjects();
        this.applyPenalty();

        return true;
    }

    /**
     * Filters the original cursor instances, returning only those with `movementType.DOWN` and `movementType.MOVE` movement ID.
     */
    private filterCursorInstances(): void {
        for (let i = 0; i < this.data.cursorMovement.length; ++i) {
            const cursorInstance: CursorData = this.data.cursorMovement[i];
            const newCursorData: CursorData = {
                size: 0,
                time: [],
                x: [],
                y: [],
                id: []
            };

            for (let j = 0; j < cursorInstance.size; ++j) {
                if (cursorInstance.id[j] === movementType.UP) {
                    continue;
                }

                ++newCursorData.size;
                newCursorData.time.push(cursorInstance.time[j]);
                newCursorData.x.push(cursorInstance.x[j]);
                newCursorData.y.push(cursorInstance.y[j]);
                newCursorData.id.push(cursorInstance.id[j]);
            }

            this.downMoveCursorInstances.push(newCursorData);
        }
    }

    /**
     * Converts hitobjects into indexed hit objects.
     */
    private indexHitObjects(): void {
        const objects: DifficultyHitObject[] = this.map.objects;
        const objectData: ReplayObjectData[] = this.data.hitObjectData;

        for (let i = 0; i < this.map.objects.length; ++i) {
            const current: DifficultyHitObject = objects[i];
            const currentData: ReplayObjectData = objectData[i];
            
            this.indexedHitObjects.push(new IndexedHitObject(current, this.getCursorIndex(current, currentData)));
        }
    }

    /**
     * Gets the cursor index that hits the given object.
     * 
     * @param object The object to check.
     * @param data The replay data of the object.
     * @returns The cursor index that hits the given object, 0 if not found.
     */
    private getCursorIndex(object: DifficultyHitObject, data: ReplayObjectData): number {
        if (object.object instanceof Spinner || data.result === hitResult.RESULT_0) {
            return 0;
        }

        const isPrecise: boolean = this.data.convertedMods.includes("PR");
        let hitWindowLength: number;
        switch (data.result) {
            case hitResult.RESULT_300:
                hitWindowLength = this.hitWindow.hitWindowFor300(isPrecise);
                break;
            case hitResult.RESULT_100:
                hitWindowLength = this.hitWindow.hitWindowFor100(isPrecise);
                break;
            default:
                hitWindowLength = this.hitWindow.hitWindowFor50(isPrecise);
        }

        const maximumHitTime: number = object.object.startTime + hitWindowLength;
        const minimumHitTime: number = object.object.startTime - hitWindowLength;

        const cursorDistances: number[] = [];

        for (let i = 0; i < this.downMoveCursorInstances.length; ++i) {
            const c: CursorData = this.downMoveCursorInstances[i];

            let minDistance: number = Number.POSITIVE_INFINITY;

            for (let j = 0; j < c.size; ++j) {
                if (c.time[j] < minimumHitTime) {
                    continue;
                }

                // For some reason, some cursor instances repeat itself,
                // so just skip it to save time.
                if (c.time[j + 1] === c.time[j]) {
                    continue;
                }

                if (c.time[j - 1] > maximumHitTime) {
                    break;
                }

                let hitPosition: Vector2 = new Vector2({
                    x: c.x[j],
                    y: c.y[j]
                });

                minDistance = Math.min(minDistance, object.object.stackedPosition.getDistance(hitPosition));

                if (c.id[j + 1] === movementType.MOVE || c.id[j] === movementType.MOVE) {
                    // Interpolate cursor position between two occurrences
                    const initialPosition: Vector2 = new Vector2({
                        x: c.x[j],
                        y: c.y[j]
                    });

                    const nextPosition: Vector2 = new Vector2({
                        x: c.x[j + 1],
                        y: c.y[j + 1]
                    });

                    const displacement: Vector2 = nextPosition.subtract(initialPosition);

                    for (let mSecPassed = c.time[j]; mSecPassed <= Math.min(c.time[j + 1], maximumHitTime); ++mSecPassed) {
                        const progress: number = (mSecPassed - c.time[j]) / (c.time[j + 1] - c.time[j]);

                        hitPosition = initialPosition.add(displacement.scale(progress));
                        minDistance = Math.min(minDistance, object.object.stackedPosition.getDistance(hitPosition));
                    }
                }
            }

            cursorDistances.push(minDistance);
        }

        let minDistance: number = Number.POSITIVE_INFINITY;
        let hitIndex: number = -1;
        for (let i = 0; i < cursorDistances.length; ++i) {
            if (minDistance > cursorDistances[i]) {
                minDistance = cursorDistances[i];
                hitIndex = i;
            }
        }

        return hitIndex;
    }

    /**
     * Applies penalty to the original star rating instance.
     */
    private applyPenalty(): void {
        const beatmaps: Beatmap[] = new Array(this.downMoveCursorInstances.length);

        this.indexedHitObjects.forEach(o => {
            if (!beatmaps[o.cursorIndex]) {
                const map: Beatmap = Utils.deepCopy(this.map.map);
                map.objects.length = 0;
                beatmaps[o.cursorIndex] = map;
            }

            beatmaps[o.cursorIndex].objects.push(o.object.object);
        });

        this.map.objects.length = 0;

        beatmaps.forEach(beatmap => {
            if (!beatmap) {
                return;
            }

            const starRating: StarRating = Utils.deepCopy(this.map);
            starRating.map = beatmap;
            starRating.generateDifficultyHitObjects();
            this.map.objects.push(...starRating.objects);
        });

        this.map.objects.sort((a, b) => {return a.startTime - b.startTime;});
        this.map.calculateAll();
    }
}