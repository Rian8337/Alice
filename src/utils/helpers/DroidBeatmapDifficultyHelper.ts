import { BeatmapDifficultyHelper } from "./BeatmapDifficultyHelper";
import {
    DroidPerformanceCalculator,
    DroidStarRating,
} from "@rian8337/osu-difficulty-calculator";
import {
    DroidPerformanceCalculator as RebalanceDroidPerformanceCalculator,
    DroidStarRating as RebalanceDroidStarRating,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import { modes } from "@rian8337/osu-base";

/**
 * A helper class for calculating osu!droid difficulty and performance of beatmaps or scores.
 */
export class DroidBeatmapDifficultyHelper extends BeatmapDifficultyHelper<
    DroidStarRating,
    RebalanceDroidStarRating,
    DroidPerformanceCalculator,
    RebalanceDroidPerformanceCalculator
> {
    protected override readonly difficultyCalculator: new () => DroidStarRating =
        DroidStarRating;
    protected override readonly rebalanceDifficultyCalculator: new () => RebalanceDroidStarRating =
        RebalanceDroidStarRating;
    protected override readonly performanceCalculator: new () => DroidPerformanceCalculator =
        DroidPerformanceCalculator;
    protected override readonly rebalancePerformanceCalculator: new () => RebalanceDroidPerformanceCalculator =
        RebalanceDroidPerformanceCalculator;
    protected override readonly mode: modes = modes.droid;
}
