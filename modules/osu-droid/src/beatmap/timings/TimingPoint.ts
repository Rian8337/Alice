/**
 * Represents a timing point in a beatmap.
 */
export abstract class TimingPoint {
    /**
     * The time at which the timing point takes effect in milliseconds.
     */
    readonly time: number;

    constructor(values: {
        /**
         * The time at which the timing point takes effect in milliseconds.
         */
        time: number;
    }) {
        this.time = values.time;
    }

    /**
     * Returns a string representative of the class.
     */
    abstract toString(): string;
}
