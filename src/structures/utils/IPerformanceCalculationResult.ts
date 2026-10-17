import {
    CacheableDifficultyAttributes,
    IDifficultyAttributes,
    IPerformanceAttributes,
} from "@rian8337/osu-difficulty-calculator";
import {
    CacheableDifficultyAttributes as RebalanceCacheableDifficultyAttributes,
    IDifficultyAttributes as IRebalanceDifficultyAttributes,
    IPerformanceAttributes as IRebalancePerformanceAttributes,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import { PerformanceCalculationParameters } from "@utils/pp/PerformanceCalculationParameters";

/**
 * A structure for implementing performance calculation results.
 */
export interface IPerformanceCalculationResult<
    P extends IPerformanceAttributes | IRebalancePerformanceAttributes,
> {
    /**
     * The calculation parameters.
     */
    readonly params: PerformanceCalculationParameters;

    /**
     * The performance of the beatmap.
     *
     * This is replaced when the performance is recalculated.
     */
    readonly result: P;

    /**
     * The difficulty attributes that the performance was calculated from.
     */
    readonly difficultyAttributes:
        | IDifficultyAttributes
        | CacheableDifficultyAttributes<IDifficultyAttributes>
        | IRebalanceDifficultyAttributes
        | RebalanceCacheableDifficultyAttributes<IRebalanceDifficultyAttributes>;

    /**
     * A string containing information about this performance calculation result's star rating.
     */
    get starRatingInfo(): string;

    /**
     * Recalculates the performance with the current calculation parameters, such as after a penalty
     * has been applied to them.
     */
    recalculate(): void;
}
