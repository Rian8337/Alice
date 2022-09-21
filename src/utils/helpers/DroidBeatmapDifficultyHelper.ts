import { BeatmapDifficultyHelper } from "./BeatmapDifficultyHelper";
import {
    DroidDifficultyCalculator,
    DroidPerformanceCalculator,
} from "@rian8337/osu-difficulty-calculator";
import {
    DroidDifficultyCalculator as RebalanceDroidDifficultyCalculator,
    DroidPerformanceCalculator as RebalanceDroidPerformanceCalculator,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import { Score } from "@rian8337/osu-droid-utilities";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { ThreeFingerChecker } from "@rian8337/osu-droid-replay-analyzer";
import { RebalancePerformanceCalculationResult } from "@alice-utils/dpp/RebalancePerformanceCalculationResult";

/**
 * A helper class for calculating osu!droid difficulty and performance of beatmaps or scores.
 */
export class DroidBeatmapDifficultyHelper extends BeatmapDifficultyHelper<
    DroidDifficultyCalculator,
    DroidPerformanceCalculator,
    RebalanceDroidDifficultyCalculator,
    RebalanceDroidPerformanceCalculator
> {
    protected override readonly difficultyCalculator =
        DroidDifficultyCalculator;
    protected override readonly rebalanceDifficultyCalculator =
        RebalanceDroidDifficultyCalculator;
    protected override readonly performanceCalculator =
        DroidPerformanceCalculator;
    protected override readonly rebalancePerformanceCalculator =
        RebalanceDroidPerformanceCalculator;

    /**
     * Applies tap penalty to a calculation result.
     *
     * @param score The score associated to the calculation result.
     * @param calcResult The calculation result to apply tap penalty to.
     */
    static async applyTapPenalty(
        score: Score,
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
        if (
            !ThreeFingerChecker.isEligibleToDetect(
                calcResult.result.difficultyCalculator
            )
        ) {
            return;
        }

        await score.downloadReplay();

        if (!score.replay?.data) {
            return;
        }

        if (!score.replay.hasBeenCheckedFor3Finger) {
            score.replay.beatmap = calcResult.result.difficultyCalculator;
            score.replay.checkFor3Finger();
            calcResult.params.tapPenalty = score.replay.tapPenalty;
        }

        calcResult.result.applyTapPenalty(score.replay.tapPenalty);
    }
}
