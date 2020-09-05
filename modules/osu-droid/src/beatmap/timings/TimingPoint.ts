/**
 * Represents a timing point in a beatmap.
 * 
 * Defines parameters such as timing and sampleset for an interval.
 * For pp calculation we only need `time` and `ms_per_beat`.
 * 
 * It can inherit from its preceeding point by having
 * `change = false` and setting `ms_per_beat` to a negative value which
 * represents the BPM multiplier as `-100 * bpm_multiplier`.
 */
export class TimingPoint {
    /**
     * The time of which the timing is applied in milliseconds.
     */
    public readonly time: number;

    /**
     * The amount of milliseconds passed for each beat.
     */
    public readonly msPerBeat: number;

    /** 
     * Whether or not the timing point does not inherit from the previous timing point.
     */
    public change: boolean;

    constructor(values: {
        time: number,
        msPerBeat?: number,
        change?: boolean
    }) {
        this.time = values.time || 0;
        this.msPerBeat = values.msPerBeat !== undefined ? values.msPerBeat : -600;
        this.change = values.change !== undefined ? values.change : true;
    }

    /**
     * Returns a string representative of the class.
     */
    toString(): string {
        return "{ time: " + this.time.toFixed(2) + ", "
            + "ms_per_beat: " + this.msPerBeat.toFixed(2) + " }";
    }
}