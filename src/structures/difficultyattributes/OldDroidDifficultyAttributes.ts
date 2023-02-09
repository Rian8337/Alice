import { DroidDifficultyAttributes } from "@rian8337/osu-difficulty-calculator";

/**
 * Holds data that can be used to calculate old osu!droid performance points.
 */
export type OldDroidDifficultyAttributes = Omit<
    DroidDifficultyAttributes,
    "aimNoteCount"
>;
