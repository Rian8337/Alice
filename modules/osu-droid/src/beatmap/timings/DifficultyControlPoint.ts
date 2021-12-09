import { TimingPoint } from "./TimingPoint";

/**
 * Represents a timing point that changes speed multiplier.
 */
export class DifficultyControlPoint extends TimingPoint {
    /**
     * The slider speed multiplier of the timing point.
     */
    readonly speedMultiplier: number;

    constructor(values: { time: number; speedMultiplier: number }) {
        super(values);
        this.speedMultiplier = values.speedMultiplier;
    }

    override toString(): string {
        return (
            "{ time: " +
            this.time.toFixed(2) +
            ", " +
            "speed multiplier: " +
            this.speedMultiplier.toFixed(2) +
            " }"
        );
    }
}
