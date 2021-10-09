import { Accuracy } from '../../utils/Accuracy';
import { modes } from '../../constants/modes';
import { StarRating } from './StarRating';
import { MapStats } from '../../utils/MapStats';
import { Mod } from '../../mods/Mod';
import { ModRelax } from '../../mods/ModRelax';
import { ModNoFail } from '../../mods/ModNoFail';
import { ModSpunOut } from '../../mods/ModSpunOut';

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
     * Calculates the performance points of a beatmap.
     */
    abstract calculate(params: {
        /**
         * The star rating instance to calculate.
         */
        stars: StarRating,

        /**
         * The maximum combo achieved in the score.
         */
        combo?: number,

        /**
         * The accuracy achieved in the score.
         */
        accPercent?: Accuracy|number,

        /**
         * The amount of misses achieved in the score.
         */
        miss?: number,

        /**
         * The gamemode to calculate.
         */
        mode?: modes,

        /**
         * The speed penalty to apply for penalized scores. Only applies to droid gamemode.
         */
        speedPenalty?: number,

        /**
         * Custom map statistics to apply custom speed multiplier and force AR values as well as old statistics.
         */
        stats?: MapStats
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
    protected handleParams(params: {
        /**
         * The star rating instance to calculate.
         */
        stars: StarRating,

        /**
         * The maximum combo achieved in the score.
         */
        combo?: number,

        /**
         * The accuracy achieved in the score.
         */
        accPercent?: Accuracy|number,

        /**
         * The amount of misses achieved in the score.
         */
        miss?: number,

        /**
         * The gamemode to calculate.
         */
        mode?: modes,

        /**
         * The speed penalty to apply for penalized scores.
         */
        speedPenalty?: number,

        /**
         * Custom map statistics to apply custom speed multiplier and force AR values as well as old statistics.
         */
        stats?: MapStats
    }, mode: modes): void {
        this.stars = params.stars;
        if (!(this.stars instanceof StarRating)) {
            throw new Error("params.stars must be in StarRating instance");
        }

        const mod: Mod[] = this.stars.mods;
        const baseAR: number = this.stars.map.ar!;
        const baseOD: number = this.stars.map.od;

        if (params.accPercent instanceof Accuracy) {
            // Copy into new instance to not modify the original
            this.computedAccuracy = new Accuracy(params.accPercent);
        } else {
            this.computedAccuracy = new Accuracy({
                percent: params.accPercent,
                nobjects: this.stars.objects.length,
                nmiss: params.miss || 0
            });
        }

        if (this.stars.mods.some(m => m instanceof ModNoFail)) {
            this.finalMultiplier *= Math.max(0.9, 1 - 0.02 * this.computedAccuracy.nmiss);
        }
        if (this.stars.mods.some(m => m instanceof ModSpunOut)) {
            this.finalMultiplier *= 1 - Math.pow(this.stars.map.spinners / this.stars.map.objects.length, 0.85);
        }
        if (this.stars.mods.some(m => m instanceof ModRelax)) {
            this.computedAccuracy.nmiss += this.computedAccuracy.n100 + this.computedAccuracy.n50;
            this.finalMultiplier *= 0.6;
        }

        this.mapStatistics = new MapStats({
            ar: baseAR,
            od: baseOD,
            mods: mod
        });

        if (params.stats) {
            this.mapStatistics.ar = params.stats.ar ?? this.mapStatistics.ar;
            this.mapStatistics.isForceAR = params.stats.isForceAR ?? this.mapStatistics.isForceAR;
            this.mapStatistics.speedMultiplier = params.stats.speedMultiplier ?? this.mapStatistics.speedMultiplier;
            this.mapStatistics.oldStatistics = params.stats.oldStatistics ?? this.mapStatistics.oldStatistics;
        }

        this.mapStatistics.calculate({mode: mode});
    }
}