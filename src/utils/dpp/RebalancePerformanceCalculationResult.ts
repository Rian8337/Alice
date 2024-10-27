import { IPerformanceCalculationResult } from "@structures/utils/IPerformanceCalculationResult";
import {
    DifficultyHitObject,
    DroidDifficultyAttributes,
    OsuDifficultyAttributes,
    DifficultyCalculator,
    PerformanceCalculator,
    DifficultyAttributes,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import { PerformanceCalculationParameters } from "./PerformanceCalculationParameters";

/**
 * Represents a beatmap's performance calculation result.
 */
export class RebalancePerformanceCalculationResult<
    D extends DifficultyCalculator<DifficultyHitObject, DifficultyAttributes>,
    P extends PerformanceCalculator<DifficultyAttributes>,
> implements IPerformanceCalculationResult<D, P>
{
    readonly params: PerformanceCalculationParameters;
    readonly result: P;
    readonly difficultyCalculator?: D;

    get starRatingInfo(): string {
        if (this.difficultyCalculator) {
            return this.difficultyCalculator.toString();
        }

        const { difficultyAttributes } = this.result;
        let string = `${difficultyAttributes.starRating.toFixed(2)} stars (`;
        const starRatingDetails: string[] = [];

        const addDetail = (num: number, suffix: string) =>
            starRatingDetails.push(`${num.toFixed(2)} ${suffix}`);

        if ("tapDifficulty" in difficultyAttributes) {
            const droidDifficultyAttributes = <DroidDifficultyAttributes>(
                difficultyAttributes
            );

            addDetail(droidDifficultyAttributes.aimDifficulty, "aim");
            addDetail(droidDifficultyAttributes.tapDifficulty, "tap");
            addDetail(droidDifficultyAttributes.rhythmDifficulty, "rhythm");
            addDetail(
                droidDifficultyAttributes.flashlightDifficulty,
                "flashlight",
            );
            addDetail(droidDifficultyAttributes.visualDifficulty, "visual");
        } else {
            const osuDifficultyAttributes = <OsuDifficultyAttributes>(
                difficultyAttributes
            );

            addDetail(osuDifficultyAttributes.aimDifficulty, "aim");
            addDetail(osuDifficultyAttributes.speedDifficulty, "speed");
            addDetail(
                osuDifficultyAttributes.flashlightDifficulty,
                "flashlight",
            );
        }

        string += starRatingDetails.join(", ") + ")";

        return string;
    }

    constructor(
        params: PerformanceCalculationParameters,
        result: P,
        difficultyCalculator?: D,
    ) {
        this.params = params;
        this.result = result;
        this.difficultyCalculator = difficultyCalculator;
    }

    requestedDifficultyCalculation(): this is this & {
        readonly difficultyCalculator: D;
        readonly strainGraphImage: Buffer;
    } {
        return this.difficultyCalculator !== undefined;
    }
}
