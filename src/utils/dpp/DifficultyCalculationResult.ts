import { IDifficultyCalculationResult } from "@alice-structures/utils/IDifficultyCalculationResult";
import { MapInfo } from "@rian8337/osu-base";
import {
    CacheableDifficultyAttributes,
    DifficultyAttributes,
    DifficultyCalculator,
    DifficultyHitObject,
} from "@rian8337/osu-difficulty-calculator";

/**
 * Represents a beatmap's difficulty calculation result.
 */
export class DifficultyCalculationResult<
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
