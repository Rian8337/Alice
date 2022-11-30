import { BeatmapDifficultyHelper } from "./BeatmapDifficultyHelper";
import {
    DroidDifficultyAttributes,
    DroidDifficultyCalculator,
    DroidPerformanceCalculator,
} from "@rian8337/osu-difficulty-calculator";
import {
    DroidDifficultyAttributes as RebalanceDroidDifficultyAttributes,
    DroidDifficultyCalculator as RebalanceDroidDifficultyCalculator,
    DroidPerformanceCalculator as RebalanceDroidPerformanceCalculator,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import { Score } from "@rian8337/osu-droid-utilities";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { ThreeFingerChecker } from "@rian8337/osu-droid-replay-analyzer";
import { RebalancePerformanceCalculationResult } from "@alice-utils/dpp/RebalancePerformanceCalculationResult";
import { CacheManager } from "@alice-utils/managers/CacheManager";

/**
 * A helper class for calculating osu!droid difficulty and performance of beatmaps or scores.
 */
export class DroidBeatmapDifficultyHelper extends BeatmapDifficultyHelper<
    DroidDifficultyCalculator,
    DroidPerformanceCalculator,
    RebalanceDroidDifficultyCalculator,
    RebalanceDroidPerformanceCalculator,
    DroidDifficultyAttributes,
    RebalanceDroidDifficultyAttributes
> {
    protected override readonly difficultyCalculator =
        DroidDifficultyCalculator;
    protected override readonly rebalanceDifficultyCalculator =
        RebalanceDroidDifficultyCalculator;
    protected override readonly performanceCalculator =
        DroidPerformanceCalculator;
    protected override readonly rebalancePerformanceCalculator =
        RebalanceDroidPerformanceCalculator;
    protected override readonly liveDifficultyAttributesCache =
        CacheManager.difficultyAttributesCache.live.droid;
    protected override readonly rebalanceDifficultyAttributesCache =
        CacheManager.difficultyAttributesCache.rebalance.droid;

    /**
     * Applies a tap penalty to a calculation result.
     *
     * @param score The score associated to the calculation result.
     * @param difficultyCalculator The difficulty calculator to calculate the tap penalty from.
     * @param calcResult The calculation result to apply the tap penalty to.
     */
    static async applyTapPenalty(
        score: Score,
        difficultyCalculator:
            | DroidDifficultyCalculator
            | RebalanceDroidDifficultyCalculator,
        calcResult:
            | PerformanceCalculationResult<
                  DroidDifficultyCalculator,
                  DroidPerformanceCalculator
              >
            | RebalancePerformanceCalculationResult<
                  RebalanceDroidDifficultyCalculator,
                  RebalanceDroidPerformanceCalculator
              >
    ): Promise<void> {
        if (!ThreeFingerChecker.isEligibleToDetect(difficultyCalculator)) {
            return;
        }

        await score.downloadReplay();

        if (!score.replay?.data) {
            return;
        }

        if (!score.replay.hasBeenCheckedFor3Finger) {
            score.replay.beatmap = difficultyCalculator;
            score.replay.checkFor3Finger();
            calcResult.params.tapPenalty = score.replay.tapPenalty;
        }

        calcResult.result.applyTapPenalty(score.replay.tapPenalty);
    }
}
