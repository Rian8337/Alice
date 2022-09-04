import { DifficultyCalculationParameters } from "./DifficultyCalculationParameters";
import { PerformanceCalculationParameters } from "./PerformanceCalculationParameters";

/**
 * Represents calculation parameters resulted from processing
 * a user's message or score.
 */
export interface ProcessedCalculationParameters {
    /**
     * The difficulty calculation parameters.
     */
    readonly difficulty: DifficultyCalculationParameters;

    /**
     * The performance calculation parameters.
     */
    readonly performance: PerformanceCalculationParameters;
}
