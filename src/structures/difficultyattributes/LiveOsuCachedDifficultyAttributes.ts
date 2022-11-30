import { OsuDifficultyAttributes } from "@rian8337/osu-difficulty-calculator";
import { CachedDifficultyAttributes } from "./CachedDifficultyAttributes";

/**
 * Difficulty attributes of a beatmap that were cached.
 *
 * This is used for osu!standard's live calculation result.
 */
export type LiveOsuCachedDifficultyAttributes =
    CachedDifficultyAttributes<OsuDifficultyAttributes>;
