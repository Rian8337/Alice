import { IDifficultyCalculationResult } from "@structures/utils/IDifficultyCalculationResult";
import { MapInfo } from "@rian8337/osu-base";
import {
    DifficultyHitObject,
    DifficultyAttributes,
    DifficultyCalculator,
    CacheableDifficultyAttributes,
} from "@rian8337/osu-rebalance-difficulty-calculator";

/**
 * Represents a beatmap's difficulty calculation result.
 */
export class RebalanceDifficultyCalculationResult<
    DA extends DifficultyAttributes,
    D extends DifficultyCalculator<DifficultyHitObject, DA>,
> implements IDifficultyCalculationResult<DA, D>
{
    readonly map: MapInfo<true>;
    readonly result: D;
    readonly cachedAttributes: CacheableDifficultyAttributes<DA>;

    constructor(
        map: MapInfo<true>,
        result: D,
        cachedAttributes: CacheableDifficultyAttributes<DA>,
    ) {
        this.map = map;
        this.result = result;
        this.cachedAttributes = cachedAttributes;
    }
}
