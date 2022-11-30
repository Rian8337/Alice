import { OsuDifficultyAttributes } from "@rian8337/osu-rebalance-difficulty-calculator";
import { CachedDifficultyAttributes } from "./CachedDifficultyAttributes";

/**
 * Difficulty attributes of a beatmap that were cached.
 *
 * This is used for osu!standard's rebalance calculation result.
 */
export type RebalanceOsuCachedDifficultyAttributes =
    CachedDifficultyAttributes<OsuDifficultyAttributes>;
