import { OldDroidDifficultyAttributes } from "@alice-structures/difficultyattributes/OldDroidDifficultyAttributes";
import { std_diff, std_ppv2 } from "ojsamadroid";

/**
 * Represents a beatmap's old performance calculation result.
 */
export class OldPerformanceCalculationResult {
    /**
     * The difficulty attributes that calculated the beatmap.
     */
    readonly difficultyAttributes: OldDroidDifficultyAttributes;

    /**
     * The performance of the beatmap.
     */
    readonly result: std_ppv2;

    /**
     * The difficulty calculator that calculated the beatmap.
     */
    readonly difficultyCalculator?: std_diff;

    /**
     * A string containing information about this performance calculation result's star rating.
     */
    get starRatingInfo(): string {
        if (this.difficultyCalculator) {
            return this.difficultyCalculator.toString();
        }

        let string: string = `${this.difficultyAttributes.starRating.toFixed(
            2
        )} stars (`;
        const starRatingDetails: string[] = [];

        const addDetail = (num: number, suffix: string) =>
            starRatingDetails.push(`${num.toFixed(2)} ${suffix}`);

        addDetail(this.difficultyAttributes.aimDifficulty, "aim");
        addDetail(this.difficultyAttributes.tapDifficulty, "speed");

        string += starRatingDetails.join(", ") + ")";

        return string;
    }

    constructor(
        difficultyAttributes: OldDroidDifficultyAttributes,
        result: std_ppv2,
        difficultyCalculator?: std_diff
    ) {
        this.difficultyAttributes = difficultyAttributes;
        this.result = result;
        this.difficultyCalculator = difficultyCalculator;
    }

    /**
     * Whether this performance calculation result requested a complete difficulty calculation.
     */
    requestedDifficultyCalculation(): this is this & {
        readonly difficultyCalculator: std_diff;
    } {
        return this.difficultyCalculator !== undefined;
    }
}
