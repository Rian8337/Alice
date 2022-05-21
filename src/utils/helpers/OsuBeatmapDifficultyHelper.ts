import { BeatmapDifficultyHelper } from "./BeatmapDifficultyHelper";
import { modes } from "@rian8337/osu-base";
import {
    OsuPerformanceCalculator,
    OsuStarRating,
} from "@rian8337/osu-difficulty-calculator";
import {
    OsuPerformanceCalculator as RebalanceOsuPerformanceCalculator,
    OsuStarRating as RebalanceOsuStarRating,
} from "@rian8337/osu-rebalance-difficulty-calculator";

/**
 * A helper class for calculating osu!standard difficulty and performance of beatmaps or scores.
 */
export class OsuBeatmapDifficultyHelper extends BeatmapDifficultyHelper<
    OsuStarRating,
    RebalanceOsuStarRating,
    OsuPerformanceCalculator,
    RebalanceOsuPerformanceCalculator
> {
    protected override readonly difficultyCalculator: new () => OsuStarRating =
        OsuStarRating;
    protected override readonly rebalanceDifficultyCalculator: new () => RebalanceOsuStarRating =
        RebalanceOsuStarRating;
    protected override readonly performanceCalculator: new () => OsuPerformanceCalculator =
        OsuPerformanceCalculator;
    protected override readonly rebalancePerformanceCalculator: new () => RebalanceOsuPerformanceCalculator =
        RebalanceOsuPerformanceCalculator;
    protected override readonly mode: modes = modes.osu;
}
