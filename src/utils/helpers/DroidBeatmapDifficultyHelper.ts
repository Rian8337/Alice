import { BeatmapDifficultyHelper } from "./BeatmapDifficultyHelper";
import {
    DroidDifficultyAttributes,
    DroidDifficultyCalculator,
    DroidPerformanceCalculator,
    ExtendedDroidDifficultyAttributes,
} from "@rian8337/osu-difficulty-calculator";
import {
    DroidDifficultyAttributes as RebalanceDroidDifficultyAttributes,
    DroidDifficultyCalculator as RebalanceDroidDifficultyCalculator,
    DroidPerformanceCalculator as RebalanceDroidPerformanceCalculator,
    ExtendedDroidDifficultyAttributes as RebalanceExtendedDroidDifficultyAttributes,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import { Score } from "@rian8337/osu-droid-utilities";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import {
    SliderCheeseInformation,
    ThreeFingerChecker,
} from "@rian8337/osu-droid-replay-analyzer";
import { RebalancePerformanceCalculationResult } from "@alice-utils/dpp/RebalancePerformanceCalculationResult";
import { CacheManager } from "@alice-utils/managers/CacheManager";
import { ReplayHelper } from "./ReplayHelper";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import { Beatmap } from "@rian8337/osu-base";

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
     * @param beatmap The beatmap associated with the score.
     * @param calcResult The calculation result to apply the tap penalty to.
     */
    static async applyTapPenalty(
        score: Score,
        beatmap: Beatmap,
        calcResult: PerformanceCalculationResult<
            DroidDifficultyCalculator,
            DroidPerformanceCalculator
        >
    ): Promise<void>;

    /**
     * Applies a tap penalty to a calculation result.
     *
     * @param score The score associated to the calculation result.
     * @param beatmap The beatmap associated with the score.
     * @param calcResult The calculation result to apply the tap penalty to.
     */
    static async applyTapPenalty(
        score: Score,
        beatmap: Beatmap,
        calcResult: RebalancePerformanceCalculationResult<
            RebalanceDroidDifficultyCalculator,
            RebalanceDroidPerformanceCalculator
        >
    ): Promise<void>;

    static async applyTapPenalty(
        score: Score,
        beatmap: Beatmap,
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
        const difficultyAttributes = <
            | ExtendedDroidDifficultyAttributes
            | RebalanceExtendedDroidDifficultyAttributes
        >calcResult.result.difficultyAttributes;
        if (!ThreeFingerChecker.isEligibleToDetect(difficultyAttributes)) {
            return;
        }

        await ReplayHelper.analyzeReplay(score);

        if (!score.replay?.data) {
            return;
        }

        if (!score.replay.hasBeenCheckedFor3Finger) {
            score.replay.beatmap ??= beatmap;
            score.replay.difficultyAttributes = difficultyAttributes;
            score.replay.checkFor3Finger();
            calcResult.params.tapPenalty = score.replay.tapPenalty;
        }

        calcResult.result.applyTapPenalty(score.replay.tapPenalty);
    }

    /**
     * Applies aim penalty to a score.
     *
     * @param score The score.
     * @param difficultyCalculator The difficulty calculator of the score.
     * @param tapPenalty The tap penalty to preemptively apply.
     * @param sliderCheesePenalty The slider cheese penalty to preemptively apply.
     * @returns The performance calculation result.
     */
    static async applyAimPenalty(
        score: Score,
        difficultyCalculator: DroidDifficultyCalculator,
        tapPenalty?: number,
        sliderCheesePenalty?: SliderCheeseInformation
    ): Promise<
        PerformanceCalculationResult<
            DroidDifficultyCalculator,
            DroidPerformanceCalculator
        >
    >;

    /**
     * Applies aim penalty to a score.
     *
     * @param score The score.
     * @param difficultyCalculator The difficulty calculator of the score.
     * @param tapPenalty The tap penalty to preemptively apply.
     * @param sliderCheesePenalty The slider cheese penalty to preemptively apply.
     * @returns The performance calculation result.
     */
    static async applyAimPenalty(
        score: Score,
        difficultyCalculator: RebalanceDroidDifficultyCalculator,
        tapPenalty?: number,
        sliderCheesePenalty?: SliderCheeseInformation
    ): Promise<
        RebalancePerformanceCalculationResult<
            RebalanceDroidDifficultyCalculator,
            RebalanceDroidPerformanceCalculator
        >
    >;

    static async applyAimPenalty(
        score: Score,
        difficultyCalculator:
            | DroidDifficultyCalculator
            | RebalanceDroidDifficultyCalculator,
        tapPenalty: number = 1,
        sliderCheesePenalty?: SliderCheeseInformation
    ): Promise<
        | PerformanceCalculationResult<
              DroidDifficultyCalculator,
              DroidPerformanceCalculator
          >
        | RebalancePerformanceCalculationResult<
              RebalanceDroidDifficultyCalculator,
              RebalanceDroidPerformanceCalculator
          >
    > {
        await ReplayHelper.analyzeReplay(score);

        if (score.replay && !score.replay.hasBeenCheckedFor2Hand) {
            score.replay.beatmap = difficultyCalculator;
            score.replay.checkFor2Hand();
        }

        const diffCalcHelper: DroidBeatmapDifficultyHelper =
            new DroidBeatmapDifficultyHelper();
        const calculationParams: PerformanceCalculationParameters =
            this.getCalculationParamsFromScore(score);
        calculationParams.tapPenalty = tapPenalty;
        calculationParams.sliderCheesePenalty = sliderCheesePenalty;

        if (difficultyCalculator instanceof DroidDifficultyCalculator) {
            return diffCalcHelper.calculateBeatmapPerformance(
                difficultyCalculator.attributes,
                calculationParams
            );
        } else {
            return diffCalcHelper.calculateBeatmapRebalancePerformance(
                difficultyCalculator.attributes,
                calculationParams
            );
        }
    }

    /**
     * Applies a slider cheese penalty to a calculation result.
     *
     * @param score The score associated to the calculation result.
     * @param beatmap The beatmap associated with the score.
     * @param calcResult The calculation result to apply the slider cheese penalty to.
     */
    static async applySliderCheesePenalty(
        score: Score,
        beatmap: Beatmap,
        calcResult: PerformanceCalculationResult<
            DroidDifficultyCalculator,
            DroidPerformanceCalculator
        >
    ): Promise<void>;

    /**
     * Applies a slider cheese penalty to a calculation result.
     *
     * @param score The score associated to the calculation result.
     * @param beatmap The beatmap associated with the score.
     * @param calcResult The calculation result to apply the slider cheese penalty to.
     */
    static async applySliderCheesePenalty(
        score: Score,
        beatmap: Beatmap,
        calcResult: RebalancePerformanceCalculationResult<
            RebalanceDroidDifficultyCalculator,
            RebalanceDroidPerformanceCalculator
        >
    ): Promise<void>;

    static async applySliderCheesePenalty(
        score: Score,
        beatmap: Beatmap,
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
        if (beatmap.hitObjects.sliders === 0) {
            return;
        }

        await ReplayHelper.analyzeReplay(score);

        if (!score.replay?.data) {
            return;
        }

        if (!score.replay.hasBeenCheckedForSliderCheesing) {
            score.replay.beatmap ??= beatmap;
            score.replay.checkForSliderCheesing();
            calcResult.params.sliderCheesePenalty =
                score.replay.sliderCheesePenalty;
        }

        calcResult.result.applyAimSliderCheesePenalty(
            score.replay.sliderCheesePenalty.aimPenalty
        );
        calcResult.result.applyFlashlightSliderCheesePenalty(
            score.replay.sliderCheesePenalty.flashlightPenalty
        );
        calcResult.result.applyVisualSliderCheesePenalty(
            score.replay.sliderCheesePenalty.visualPenalty
        );
    }
}
