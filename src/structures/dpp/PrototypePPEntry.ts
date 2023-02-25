import { PPEntry } from "./PPEntry";

export interface PrototypePPEntry extends PPEntry {
    /**
     * The pp before the score was recalculated.
     */
    prevPP: number;

    /**
     * The previous aim pp value.
     */
    prevAim: number;

    /**
     * The previous tap pp value.
     */
    prevTap: number;

    /**
     * The previous accuracy pp value.
     */
    prevAccuracy: number;

    /**
     * The previous visual pp value.
     */
    prevVisual: number;

    /**
     * The new aim pp value.
     */
    newAim: number;

    /**
     * The new tap pp value.
     */
    newTap: number;

    /**
     * The new accuracy pp value.
     */
    newAccuracy: number;

    /**
     * The new visual pp value.
     */
    newVisual: number;

    /**
     * The calculated unstable rate of the score.
     */
    calculatedUnstableRate: number | null;

    /**
     * The estimated unstable rate of the score.
     */
    estimatedUnstableRate: number;

    /**
     * The estimated speed unstable rate of the score.
     */
    estimatedSpeedUnstableRate: number;

    /**
     * The number of clickable objects weighted by difficulty.
     *
     * Related to aim difficulty.
     */
    aimNoteCount: number;

    /**
     * The amount of two-handed objects.
     */
    twoHandedNoteCount: number;

    /**
     * Whether this score is assumed to be two-handed.
     */
    assumedTwoHand: boolean;

    /**
     * The evaluated overall difficulty of the score.
     */
    overallDifficulty: number;

    /**
     * The amount of great hits achieved in the score.
     */
    hit300: number;

    /**
     * The amount of good hits achieved in the score.
     */
    hit100: number;

    /**
     * The amount of meh hits achieved in the score.
     */
    hit50: number;

    /**
     * The aim slider cheese penalty of the score.
     */
    aimSliderCheesePenalty: number;

    /**
     * The visual slider cheese penalty of the score.
     */
    visualSliderCheesePenalty: number;

    /**
     * The number of clickable objects weighted by difficulty.
     *
     * Related to tap difficulty.
     */
    speedNoteCount: number;
}
