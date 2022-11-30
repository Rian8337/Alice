import { DroidDifficultyAttributes } from "@rian8337/osu-difficulty-calculator";
import { CachedDifficultyAttributes } from "./CachedDifficultyAttributes";

/**
 * Difficulty attributes of a beatmap that were cached.
 *
 * This is used for osu!droid's live calculation result.
 */
export type LiveDroidCachedDifficultyAttributes =
    CachedDifficultyAttributes<DroidDifficultyAttributes>;
