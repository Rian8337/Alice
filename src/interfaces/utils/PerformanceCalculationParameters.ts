import { Accuracy, MapStats, Mod } from "osu-droid";
import { StarRatingCalculationParameters } from "./StarRatingCalculationParameters";

/**
 * Represents a parameter to alter performance calculation result.
 */
export interface PerformanceCalculationParameters extends StarRatingCalculationParameters {
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
    tapPenalty?: number;
};