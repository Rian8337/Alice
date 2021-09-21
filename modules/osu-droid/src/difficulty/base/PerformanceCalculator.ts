import { Accuracy } from '../../utils/Accuracy';
import { modes } from '../../constants/modes';
import { StarRating } from './StarRating';
import { MapStats } from '../../utils/MapStats';
import { Mod } from '../../mods/Mod';

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
        tapPenalty?: number,

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
        tapPenalty?: number,

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
        const baseAR: number = <number> this.stars.map.ar;
        const baseOD: number = this.stars.map.od;

        if (params.accPercent instanceof Accuracy) {
            this.computedAccuracy = params.accPercent;
        } else {
            this.computedAccuracy = new Accuracy({
                percent: params.accPercent,
                nobjects: this.stars.objects.length,
                nmiss: params.miss || 0
            });
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