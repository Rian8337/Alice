import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import {
    DifficultyAttributes,
    DifficultyCalculator,
    DifficultyHitObject,
    PerformanceCalculator,
} from "@rian8337/osu-difficulty-calculator";
import {
    DifficultyAttributes as RebalanceDifficultyAttributes,
    DifficultyCalculator as RebalanceDifficultyCalculator,
    DifficultyHitObject as RebalanceDifficultyHitObject,
    PerformanceCalculator as RebalancePerformanceCalculator,
} from "@rian8337/osu-rebalance-difficulty-calculator";

/**
 * A structure for implementing performance calculation results.
 */
export interface IPerformanceCalculationResult<
    D extends
        | DifficultyCalculator<DifficultyHitObject, DifficultyAttributes>
        | RebalanceDifficultyCalculator<
              RebalanceDifficultyHitObject,
              RebalanceDifficultyAttributes
          >,
    P extends
        | PerformanceCalculator<DifficultyAttributes>
        | RebalancePerformanceCalculator<RebalanceDifficultyAttributes>,
> {
    /**
     * The calculation parameters.
     */
    readonly params: PerformanceCalculationParameters;

    /**
     * The performance of the beatmap.
     */
    readonly result: P;

    /**
     * The difficulty calculator of the beatmap, if the beatmap was calculated on fly.
     */
    readonly difficultyCalculator?: D;

    /**
     * A string containing information about this performance calculation result's star rating.
     */
    get starRatingInfo(): string;

    /**
     * Whether this performance calculation result requested a complete difficulty calculation.
     */
    requestedDifficultyCalculation(): this is this & {
        readonly difficultyCalculator: D;
    };
}
