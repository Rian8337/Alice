import { DroidPerformanceAttributes } from "./DroidPerformanceAttributes";

/**
 * A structure containing information about a performance calculation result.
 */
export interface RebalanceDroidPerformanceAttributes
    extends DroidPerformanceAttributes {
    /**
     * The calculated unstable rate of the score.
     */
    calculatedUnstableRate: number;

    /**
     * The estimated unstable rate of the score.
     */
    estimatedUnstableRate: number;

    /**
     * The estimated speed unstable rate of the score.
     */
    estimatedSpeedUnstableRate: number;
}
