/**
 * Represents information summary about obtained slider ticks in a replay.
 */
export interface SliderTickInformation {
    /**
     * The amount of ticks obtained.
     */
    obtained: number;

    /**
     * The total amount of ticks.
     */
    readonly total: number;
}
