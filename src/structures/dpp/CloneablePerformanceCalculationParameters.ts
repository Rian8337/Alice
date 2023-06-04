import { SliderCheeseInformation } from "@rian8337/osu-droid-replay-analyzer";
import { CloneableDifficultyCalculationParameters } from "./CloneableDifficultyCalculationParameters";

/**
 * Represents a parameter to alter performance calculation result that can be cloned
 * for specific purposes (i.e., passing data between worker threads).
 */
export interface CloneablePerformanceCalculationParameters
    extends CloneableDifficultyCalculationParameters {
    /**
     * The combo achieved.
     */
    combo?: number;

    /**
     * The accuracy achieved.
     */
    accuracy: {
        /**
         * The amount of 300s achieved.
         */
        n300?: number;

        /**
         * The amount of 100s achieved.
         */
        n100?: number;

        /**
         * The amount of 50s achieved.
         */
        n50?: number;

        /**
         * The amount of misses achieved.
         */
        nmiss?: number;
    };

    /**
     * The tap penalty to apply for penalized scores.
     */
    tapPenalty: number;

    /**
     * The slider cheese penalties to apply for penalized scores.
     */
    sliderCheesePenalty?: SliderCheeseInformation;
}
