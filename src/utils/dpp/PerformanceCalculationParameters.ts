import { Accuracy, MapStats, Precision } from "@rian8337/osu-base";
import { DifficultyAttributes } from "@rian8337/osu-difficulty-calculator";
import { DifficultyAttributes as RebalanceDifficultyAttributes } from "@rian8337/osu-rebalance-difficulty-calculator";
import { DifficultyCalculationParameters } from "./DifficultyCalculationParameters";

/**
 * Represents a parameter to alter performance calculation result.
 */
export class PerformanceCalculationParameters extends DifficultyCalculationParameters {
    /**
     * The combo achieved.
     */
    combo?: number;

    /**
     * The accuracy achieved.
     */
    accuracy: Accuracy;

    /**
     * The tap penalty to apply for penalized scores.
     */
    tapPenalty: number;

    /**
     * The slider cheese penalty to apply for penalized scores.
     */
    sliderCheesePenalty: number;

    /**
     * The accuracy that a user inputs, if any. Defaults to 100.
     */
    inputAccuracy: number;

    /**
     * Whether the calculation result from this parameter is an estimation.
     */
    get isEstimated(): boolean {
        return !Precision.almostEqualsNumber(
            this.accuracy.value() * 100,
            this.inputAccuracy,
            1e-2
        );
    }

    /**
     * @param accuracy The accuracy achieved.
     * @param inputAccuracy The accuracy that a user inputs, if any.
     * @param combo The combo achieved.
     * @param tapPenalty The tap penalty to apply for penalized scores.
     * @param customStatistics The custom statistics that was used in difficulty calculation.
     */
    constructor(
        accuracy: Accuracy,
        inputAccuracy: number = 100,
        combo?: number,
        tapPenalty: number = 1,
        sliderCheesePenalty: number = 1,
        customStatistics?: MapStats
    ) {
        super(customStatistics);

        this.accuracy = accuracy;
        this.combo = combo;
        this.tapPenalty = tapPenalty;
        this.sliderCheesePenalty = sliderCheesePenalty;
        this.inputAccuracy = inputAccuracy;
    }

    /**
     * Applies difficulty attributes to alter this parameter.
     *
     * @param attributes The difficulty attributes.
     */
    applyFromAttributes(
        attributes: DifficultyAttributes | RebalanceDifficultyAttributes
    ): void {
        const objectCount: number =
            attributes.hitCircleCount +
            attributes.sliderCount +
            attributes.spinnerCount;

        if (this.accuracy.n50 || this.accuracy.n100) {
            this.accuracy = new Accuracy({
                n300:
                    objectCount -
                    this.accuracy.n100 -
                    this.accuracy.n50 -
                    this.accuracy.nmiss,
                n100: this.accuracy.n100,
                n50: this.accuracy.n50,
                nmiss: this.accuracy.nmiss,
            });
        } else {
            this.accuracy = new Accuracy({
                percent: this.inputAccuracy,
                nmiss: this.accuracy.nmiss,
                nobjects: objectCount,
            });
        }
    }
}
