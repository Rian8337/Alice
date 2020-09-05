/**
 * Represents a break period in a beatmap.
 */
export class BreakPoint {
    /**
     * The start time of the break period.
     */
    public readonly startTime: number;

    /**
     * The end time of the break period.
     */
    public readonly endTime: number;

    /**
     * The duration of the break period. This is obtained from `endTime - startTime`.
     */
    public readonly duration: number;

    constructor(values: {
        startTime: number,
        endTime: number
    }) {
        this.startTime = values.startTime;
        this.endTime = values.endTime;
        this.duration = this.endTime - this.startTime;
    }

    /**
     * Returns a string representation of the class.
     */
    toString(): string {
        return `Start time: ${this.startTime}, end time: ${this.endTime}, duration: ${this.duration}`;
    }
}