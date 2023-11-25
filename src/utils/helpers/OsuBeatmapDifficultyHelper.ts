import { BeatmapDifficultyHelper } from "./BeatmapDifficultyHelper";
import {
    OsuDifficultyAttributes,
    OsuDifficultyCalculator,
    OsuPerformanceCalculator,
} from "@rian8337/osu-difficulty-calculator";
import {
    OsuDifficultyAttributes as RebalanceOsuDifficultyAttributes,
    OsuDifficultyCalculator as RebalanceOsuDifficultyCalculator,
    OsuPerformanceCalculator as RebalanceOsuPerformanceCalculator,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import { CacheManager } from "@alice-utils/managers/CacheManager";

/**
 * A helper class for calculating osu!standard difficulty and performance of beatmaps or scores.
 */
export class OsuBeatmapDifficultyHelper extends BeatmapDifficultyHelper<
    OsuDifficultyAttributes,
    RebalanceOsuDifficultyAttributes,
    OsuDifficultyCalculator,
    OsuPerformanceCalculator,
    RebalanceOsuDifficultyCalculator,
    RebalanceOsuPerformanceCalculator
> {
    protected override readonly difficultyCalculator = OsuDifficultyCalculator;
    protected override readonly rebalanceDifficultyCalculator =
        RebalanceOsuDifficultyCalculator;
    protected override readonly performanceCalculator =
        OsuPerformanceCalculator;
    protected override readonly rebalancePerformanceCalculator =
        RebalanceOsuPerformanceCalculator;
    protected override readonly liveDifficultyAttributesCache =
        CacheManager.difficultyAttributesCache.live.osu;
    protected override readonly rebalanceDifficultyAttributesCache =
        CacheManager.difficultyAttributesCache.rebalance.osu;
}
