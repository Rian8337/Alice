/**
 * Represents a timing point in a beatmap.
 */
export class TimingPoint {
    /**
     * The time of which the timing is applied in milliseconds.
     */
    readonly time: number;

    /**
     * The amount of milliseconds passed for each beat.
     */
    readonly msPerBeat: number;

    /**
     * The slider speed multiplier of the timing point.
     */
    readonly speedMultiplier: number;

    /** 
     * Whether or not the timing point does not inherit from the previous timing point.
     */
    readonly change: boolean;

    constructor(values: {
        time: number,
        msPerBeat?: number,
        change?: boolean,
        speedMultiplier: number
    }) {
        this.time = values.time || 0;
        this.msPerBeat = values.msPerBeat !== undefined ? values.msPerBeat : -600;
        this.change = values.change !== undefined ? values.change : true;
        this.speedMultiplier = values.speedMultiplier;
    }

    /**
     * Returns a string representative of the class.
     */
    toString(): string {
        return "{ time: " + this.time.toFixed(2) + ", "
            + "ms_per_beat: " + this.msPerBeat.toFixed(2) + " }";
    }
}