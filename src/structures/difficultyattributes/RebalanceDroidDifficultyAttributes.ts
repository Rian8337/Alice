import { DroidDifficultyAttributes } from "@rian8337/osu-rebalance-difficulty-calculator";
import { CachedDifficultyAttributes } from "./CachedDifficultyAttributes";

/**
 * Difficulty attributes of a beatmap that were cached.
 *
 * This is used for osu!droid's rebalance calculation result.
 */
export type RebalanceDroidCachedDifficultyAttributes =
    CachedDifficultyAttributes<DroidDifficultyAttributes>;
