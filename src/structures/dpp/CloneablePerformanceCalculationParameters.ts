import { SliderCheeseInformation } from "@rian8337/osu-droid-replay-analyzer";
import { CloneableDifficultyCalculationParameters } from "./CloneableDifficultyCalculationParameters";
import { Optional } from "@alice-structures/utils/Optional";

/**
 * Represents a parameter to alter performance calculation result that can be cloned
 * for specific purposes (i.e., passing data between worker threads).
 */
export interface CloneablePerformanceCalculationParameters<
    TFromCalculation extends boolean = boolean,
> extends CloneableDifficultyCalculationParameters<TFromCalculation> {
    /**
     * The combo achieved.
     */
    combo: Optional<TFromCalculation, number>;

    /**
     * The accuracy achieved.
     */
    accuracy: {
        /**
         * The amount of 300s achieved.
         */
        n300: Optional<TFromCalculation, number>;

        /**
         * The amount of 100s achieved.
         */
        n100: Optional<TFromCalculation, number>;

        /**
         * The amount of 50s achieved.
         */
        n50: Optional<TFromCalculation, number>;

        /**
         * The amount of misses achieved.
         */
        nmiss: Optional<TFromCalculation, number>;
    };

    /**
     * The tap penalty to apply for penalized scores.
     */
    tapPenalty: Optional<TFromCalculation, number>;

    /**
     * The slider cheese penalties to apply for penalized scores.
     */
    sliderCheesePenalty: Optional<TFromCalculation, SliderCheeseInformation>;
}
