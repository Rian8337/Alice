import { Accuracy } from "../../utils/Accuracy";
import { modes } from "../../constants/modes";
import { StarRating } from "./StarRating";
import { MapStats } from "../../utils/MapStats";
import { Mod } from "../../mods/Mod";
import { ModRelax } from "../../mods/ModRelax";
import { ModNoFail } from "../../mods/ModNoFail";
import { ModSpunOut } from "../../mods/ModSpunOut";
import { MathUtils } from "../../mathutil/MathUtils";

/**
 * The base class of performance calculators.
 */
export abstract class PerformanceCalculator {
    /**
     * The overall performance value.
     */
    total: number = 0;

    /**
     * The calculated accuracy.
     */
    computedAccuracy: Accuracy = new Accuracy({});

    /**
     * The calculated beatmap.
     */
    abstract stars: StarRating;

    /**
     * The map statistics after applying modifications.
     */
    protected mapStatistics: MapStats = new MapStats();

    /**
     * Penalty for combo breaks.
     */
    protected comboPenalty: number = 0;

    /**
     * The global multiplier to be applied to the final performance value.
     *
     * This is being adjusted to keep the final value scaled around what it used to be when changing things.
     */
    protected abstract finalMultiplier: number;

    /**
     * The amount of misses that are filtered out from sliderbreaks.
     */
    protected effectiveMissCount: number = 0;

    /**
     * Nerf factor used for nerfing beatmaps with very likely dropped sliderends.
     */
    protected sliderNerfFactor: number = 1;

    /**
     * Calculates the performance points of a beatmap.
     */
    abstract calculate(params: {
        /**
         * The star rating instance to calculate.
         */
        stars: StarRating;

        /**
         * The maximum combo achieved in the score.
         */
        combo?: number;

        /**
         * The accuracy achieved in the score.
         */
        accPercent?: Accuracy | number;

        /**
         * The amount of misses achieved in the score.
         */
        miss?: number;

        /**
         * The gamemode to calculate.
         */
        mode?: modes;

        /**
         * The speed penalty to apply for penalized scores. Only applies to droid gamemode.
         */
        speedPenalty?: number;

        /**
         * Custom map statistics to apply custom speed multiplier and force AR values as well as old statistics.
         */
        stats?: MapStats;
    }): this;

    /**
     * Returns a string representative of the class.
     */
    abstract toString(): string;

    /**
     * Calculates the base performance value for of a star rating.
     */
    protected baseValue(stars: number): number {
        return Math.pow(5 * Math.max(1, stars / 0.0675) - 4, 3) / 100000;
    }

    /**
     * Processes given parameters for usage in performance calculation.
     */
    protected handleParams(
        params: {
            /**
             * The star rating instance to calculate.
             */
            stars: StarRating;

            /**
             * The maximum combo achieved in the score.
             */
            combo?: number;

            /**
             * The accuracy achieved in the score.
             */
            accPercent?: Accuracy | number;

            /**
             * The amount of misses achieved in the score.
             */
            miss?: number;

            /**
             * The gamemode to calculate.
             */
            mode?: modes;

            /**
             * The tap penalty to apply for penalized scores.
             */
            tapPenalty?: number;

            /**
             * Custom map statistics to apply custom speed multiplier and force AR values as well as old statistics.
             */
            stats?: MapStats;
        },
        mode: modes
    ): void {
        this.stars = params.stars;

        const maxCombo: number = this.stars.map.maxCombo;
        const miss: number = this.computedAccuracy.nmiss;
        const combo: number = params.combo ?? maxCombo - miss;
        const mod: Mod[] = this.stars.mods;
        const baseAR: number = this.stars.map.ar!;
        const baseOD: number = this.stars.map.od;

        // Penalize misses by assessing # of misses relative to the total # of objects. Default a 3% reduction for any # of misses.
        this.comboPenalty = Math.min(Math.pow(combo / maxCombo, 0.8), 1);

        if (params.accPercent instanceof Accuracy) {
            // Copy into new instance to not modify the original
            this.computedAccuracy = new Accuracy(params.accPercent);
        } else {
            this.computedAccuracy = new Accuracy({
                percent: params.accPercent,
                nobjects: this.stars.objects.length,
                nmiss: params.miss || 0,
            });
        }

        if (this.stars.mods.some((m) => m instanceof ModNoFail)) {
            this.finalMultiplier *= Math.max(
                0.9,
                1 - 0.02 * this.computedAccuracy.nmiss
            );
        }
        if (this.stars.mods.some((m) => m instanceof ModSpunOut)) {
            this.finalMultiplier *=
                1 -
                Math.pow(
                    this.stars.map.spinners / this.stars.objects.length,
                    0.85
                );
        }
        if (this.stars.mods.some((m) => m instanceof ModRelax)) {
            this.computedAccuracy.nmiss +=
                this.computedAccuracy.n100 + this.computedAccuracy.n50;
            this.finalMultiplier *= 0.6;
        }

        this.effectiveMissCount = this.calculateEffectiveMissCount(
            combo,
            maxCombo
        );

        this.mapStatistics = new MapStats({
            ar: baseAR,
            od: baseOD,
            mods: mod,
        });

        // We assume 15% of sliders in a beatmap are difficult since there's no way to tell from the performance calculator.
        const estimateDifficultSliders: number = this.stars.map.sliders * 0.15;
        const estimateSliderEndsDropped: number = MathUtils.clamp(
            Math.min(
                this.computedAccuracy.n300 +
                    this.computedAccuracy.n50 +
                    this.computedAccuracy.nmiss,
                maxCombo - combo
            ),
            0,
            estimateDifficultSliders
        );

        if (this.stars.map.sliders > 0) {
            this.sliderNerfFactor =
                (1 - this.stars.attributes.sliderFactor) *
                    Math.pow(
                        1 -
                            estimateSliderEndsDropped /
                                estimateDifficultSliders,
                        3
                    ) +
                this.stars.attributes.sliderFactor;
        }

        if (params.stats) {
            this.mapStatistics.ar = params.stats.ar ?? this.mapStatistics.ar;
            this.mapStatistics.isForceAR =
                params.stats.isForceAR ?? this.mapStatistics.isForceAR;
            this.mapStatistics.speedMultiplier =
                params.stats.speedMultiplier ??
                this.mapStatistics.speedMultiplier;
            this.mapStatistics.oldStatistics =
                params.stats.oldStatistics ?? this.mapStatistics.oldStatistics;
        }

        this.mapStatistics.calculate({ mode: mode });
    }

    /**
     * Calculates the amount of misses + sliderbreaks from combo.
     */
    private calculateEffectiveMissCount(
        combo: number,
        maxCombo: number
    ): number {
        let comboBasedMissCount: number = 0;

        if (this.stars.map.sliders > 0) {
            const fullComboThreshold: number =
                maxCombo - 0.1 * this.stars.map.sliders;

            if (combo < fullComboThreshold) {
                // We're clamping miss count because since it's derived from combo, it can
                // be higher than the amount of objects and that breaks some calculations.
                comboBasedMissCount = Math.min(
                    fullComboThreshold / Math.max(1, combo),
                    this.stars.objects.length
                );
            }
        }

        return Math.max(
            this.computedAccuracy.nmiss,
            Math.floor(comboBasedMissCount)
        );
    }
}
