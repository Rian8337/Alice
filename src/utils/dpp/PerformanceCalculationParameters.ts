import { Accuracy, MapInfo, MapStats, Mod, Precision } from "osu-droid";
import { StarRatingCalculationParameters } from "./StarRatingCalculationParameters";

/**
 * Represents a parameter to alter performance calculation result.
 */
export class PerformanceCalculationParameters extends StarRatingCalculationParameters {
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
     * The accuracy that a user inputs, if any. Defaults to 100.
     */
    inputAccuracy: number;

    /**
     * Whether the calculation result from this parameter will be an estimation.
     */
    isEstimated: boolean = false;

    /**
     * @param mods The modifications to calculate for.
     * @param accuracy The accuracy achieved.
     * @param inputAccuracy The accuracy that a user inputs, if any.
     * @param combo The combo achieved.
     * @param tapPenalty The tap penalty to apply for penalized scores.
     * @param customStatistics  Custom statistics to apply custom speed multiplier and force AR as well as NightCore mod penalty for replay version 3 or older.
     */
    constructor(
        mods: Mod[],
        accuracy: Accuracy,
        inputAccuracy: number = 100,
        combo?: number,
        tapPenalty: number = 1,
        customStatistics?: MapStats
    ) {
        super(mods, customStatistics);

        this.accuracy = accuracy;
        this.combo = combo;
        this.tapPenalty = tapPenalty;
        this.inputAccuracy = inputAccuracy;
    }

    /**
     * Applies a beatmap to alter this parameter.
     *
     * @param beatmap The beatmap.
     */
    applyFromBeatmap(beatmap: MapInfo): void {
        if (this.accuracy.n50 || this.accuracy.n100) {
            this.accuracy = new Accuracy({
                n300:
                    beatmap.objects -
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
                nobjects: beatmap.objects,
            });

            this.isEstimated = !Precision.almostEqualsNumber(
                this.accuracy.value() * 100,
                this.inputAccuracy,
                1e-2
            );
        }
    }
}
