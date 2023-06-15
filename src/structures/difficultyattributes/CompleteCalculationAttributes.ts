import { CloneablePerformanceCalculationParameters } from "@alice-structures/dpp/CloneablePerformanceCalculationParameters";
import { PerformanceAttributes } from "./PerformanceAttributes";
import { RawDifficultyAttributes } from "./RawDifficultyAttributes";
import { ReplayAttributes } from "./ReplayAttributes";
import { ResponseDifficultyAttributes } from "./ResponseDifficultyAttributes";

/**
 * An attribute with complete calculation result.
 */
export interface CompleteCalculationAttributes<
    TDiffAttr extends RawDifficultyAttributes,
    TPerfAttr extends PerformanceAttributes
> {
    /**
     * The parameters that were used to obtain the calculation result.
     */
    readonly params: CloneablePerformanceCalculationParameters;

    /**
     * The difficulty attributes.
     */
    readonly difficulty: ResponseDifficultyAttributes<TDiffAttr>;

    /**
     * The performance attributes.
     */
    readonly performance: TPerfAttr;

    /**
     * The replay attributes, if any.
     */
    readonly replay?: ReplayAttributes;
}
