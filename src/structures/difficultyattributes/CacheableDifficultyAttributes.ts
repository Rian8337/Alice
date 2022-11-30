import { DifficultyAttributes } from "@rian8337/osu-difficulty-calculator";
import { DifficultyAttributes as RebalanceDifficultyAttributes } from "@rian8337/osu-rebalance-difficulty-calculator";

/**
 * Represents difficulty attributes that can be cached.
 */
export type CacheableDifficultyAttributes<
    T extends DifficultyAttributes | RebalanceDifficultyAttributes
> = Omit<T, "mods">;
