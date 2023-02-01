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
}
