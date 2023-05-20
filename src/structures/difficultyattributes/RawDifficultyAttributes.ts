import { DifficultyAttributes } from "@rian8337/osu-difficulty-calculator";
import { DifficultyAttributes as RebalanceDifficultyAttributes } from "@rian8337/osu-rebalance-difficulty-calculator";

/**
 * A base difficulty attributes structure for all difficulty attributes.
 */
export type RawDifficultyAttributes =
    | DifficultyAttributes
    | RebalanceDifficultyAttributes;
