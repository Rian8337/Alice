import { DifficultyAttributes } from "@rian8337/osu-difficulty-calculator";
import { DifficultyAttributes as RebalanceDifficultyAttributes } from "@rian8337/osu-rebalance-difficulty-calculator";
import { CacheableDifficultyAttributes } from "./CacheableDifficultyAttributes";

/**
 * Difficulty attributes of a beatmap that were cached.
 */
export interface CachedDifficultyAttributes<
    T extends DifficultyAttributes | RebalanceDifficultyAttributes
> {
    /**
     * The time at which the beatmap was last updated.
     */
    lastUpdate: number;

    /**
     * The difficulty attributes of the beatmap, following the formatting rule:
     *
     * `"<mods (in droid mod string for droid, in bitwise for standard)>[|<speed multiplier>x[|AR<force AR>]]": {}`
     */
    difficultyAttributes: Record<string, CacheableDifficultyAttributes<T>>;
}
