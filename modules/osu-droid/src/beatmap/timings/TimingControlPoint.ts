import { TimingPoint } from "./TimingPoint";

/**
 * Represents a timing point that changes the beatmap's BPM.
 */
export class TimingControlPoint extends TimingPoint {
    /**
     * The amount of milliseconds passed for each beat.
     */
    readonly msPerBeat: number;

    constructor(values: { time: number; msPerBeat: number }) {
        super(values);
        this.msPerBeat = values.msPerBeat;
    }

    override toString(): string {
        return (
            "{ time: " +
            this.time.toFixed(2) +
            ", " +
            "ms_per_beat: " +
            this.msPerBeat.toFixed(2) +
            " }"
        );
    }
}
