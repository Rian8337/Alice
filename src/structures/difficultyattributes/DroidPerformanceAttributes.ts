import { PerformanceAttributes } from "./PerformanceAttributes";

/**
 * A structure containing information about a performance calculation result.
 */
export interface DroidPerformanceAttributes extends PerformanceAttributes {
    /**
     * The tap performance points.
     */
    tap: number;

    /**
     * The visual performance points.
     */
    visual: number;
}
