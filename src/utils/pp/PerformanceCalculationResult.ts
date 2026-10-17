import {
    IDifficultyAttributes,
    IDroidDifficultyAttributes,
    IOsuDifficultyAttributes,
    IPerformanceAttributes,
    PerformanceCalculator,
} from "@rian8337/osu-difficulty-calculator";
import { IPerformanceCalculationResult } from "@structures/utils/IPerformanceCalculationResult";
import { PerformanceCalculationParameters } from "./PerformanceCalculationParameters";

/**
 * Represents a beatmap's performance calculation result.
 */
export class PerformanceCalculationResult<P extends IPerformanceAttributes>
    implements IPerformanceCalculationResult<P>
{
    readonly params: PerformanceCalculationParameters;
    result: P;

    private readonly calculator: PerformanceCalculator<
        IDifficultyAttributes,
        P
    >;

    get difficultyAttributes() {
        return this.calculator.difficultyAttributes;
    }

    get starRatingInfo(): string {
        const { difficultyAttributes } = this;
        let string = `${difficultyAttributes.starRating.toFixed(2)} stars (`;
        const starRatingDetails: string[] = [];

        const addDetail = (num: number, suffix: string) =>
            starRatingDetails.push(`${num.toFixed(2)} ${suffix}`);

        if ("tapDifficulty" in difficultyAttributes) {
            const droidDifficultyAttributes = <IDroidDifficultyAttributes>(
                difficultyAttributes
            );

            addDetail(droidDifficultyAttributes.aimDifficulty, "aim");
            addDetail(droidDifficultyAttributes.tapDifficulty, "tap");
            addDetail(droidDifficultyAttributes.rhythmDifficulty, "rhythm");
            addDetail(
                droidDifficultyAttributes.flashlightDifficulty,
                "flashlight"
            );
            addDetail(droidDifficultyAttributes.readingDifficulty, "reading");
        } else {
            const osuDifficultyAttributes = <IOsuDifficultyAttributes>(
                difficultyAttributes
            );

            addDetail(osuDifficultyAttributes.aimDifficulty, "aim");
            addDetail(osuDifficultyAttributes.speedDifficulty, "speed");
            addDetail(
                osuDifficultyAttributes.flashlightDifficulty,
                "flashlight"
            );
        }

        string += starRatingDetails.join(", ") + ")";

        return string;
    }

    constructor(
        params: PerformanceCalculationParameters,
        calculator: PerformanceCalculator<IDifficultyAttributes, P>,
        result: P
    ) {
        this.params = params;
        this.calculator = calculator;
        this.result = result;
    }

    recalculate(): void {
        this.result = this.calculator.calculate(
            this.params.toPerformanceCalculationOptions()
        );
    }
}
