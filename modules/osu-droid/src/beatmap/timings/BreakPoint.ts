/**
 * Represents a break period in a beatmap.
 */
export class BreakPoint {
    /**
     * The minimum duration required for a break to have any effect.
     */
    static readonly MIN_BREAK_DURATION: number = 650;

    /**
     * The start time of the break period.
     */
    readonly startTime: number;

    /**
     * The end time of the break period.
     */
    readonly endTime: number;

    /**
     * The duration of the break period. This is obtained from `endTime - startTime`.
     */
    readonly duration: number;

    constructor(values: { startTime: number; endTime: number }) {
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

    /**
     * Whether this break period contains a specified time.
     *
     * @param time The time to check in milliseconds.
     * @returns Whether the time falls within this break period.
     */
    contains(time: number): boolean {
        return (
            time >= this.startTime &&
            time <= this.endTime - BreakPoint.MIN_BREAK_DURATION / 2
        );
    }
}
