import { Accuracy } from '../utils/Accuracy';
import { modes } from '../constants/modes';
import { OsuStarRating } from './OsuStarRating';
import { MapStats } from '../utils/MapStats';
import { mods } from '../utils/mods';
import { PerformanceCalculator } from './base/PerformanceCalculator';

/**
 * A performance points calculator that calculates performance points for osu!standard gamemode.
 */
export class OsuPerformanceCalculator extends PerformanceCalculator {
    protected stars: OsuStarRating = new OsuStarRating();

    /**
     * The aim performance value.
     */
    aim: number = 0;

    /**
     * The speed performance value.
     */
    speed: number = 0;
    
    /**
     * The accuracy performance value.
     */
    accuracy: number = 0;
    
    calculate(params: {
        /**
         * The star rating instance to calculate.
         */
        stars: OsuStarRating,

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
         * Custom map statistics to apply custom speed multiplier and force AR values as well as old statistics.
         */
        stats?: MapStats
    }): this {
        this.handleParams(params, modes.osu);

        const objectCount: number = this.stars.objects.length;
        const maxCombo: number = this.stars.map.maxCombo();
        const miss: number = this.computedAccuracy.nmiss;
        const combo: number = params.combo || maxCombo - miss;

        // Penalize misses by assessing # of misses relative to the total # of objects. Default a 3% reduction for any # of misses.
        this.comboPenalty = Math.min(Math.pow(combo / maxCombo, 0.8), 1);

        this.calculateAimValue();
        this.calculateSpeedValue();
        this.calculateAccuracyValue();

        // Custom multiplier for SO and NF.
        // This is being adjusted to keep the final pp value scaled around what it used to be when changing things.
        let finalMultiplier: number = 1.12;
        if (this.convertedMods & mods.osuMods.nf) {
            finalMultiplier *= Math.max(0.9, 1 - 0.02 * miss);
        }
        if (this.convertedMods & mods.osuMods.so) {
            finalMultiplier *= 1 - Math.pow(this.stars.map.spinners / objectCount, 0.85);
        }

        this.total = Math.pow(
            Math.pow(this.aim, 1.1) + Math.pow(this.speed, 1.1) +
            Math.pow(this.accuracy, 1.1),
            1 / 1.1
        ) * finalMultiplier;

        return this;
    }

    /**
     * Calculates the aim performance value of the beatmap.
     */
    protected calculateAimValue(): void {
        // Global variables
        const objectCount: number = this.stars.objects.length;
        const calculatedAR: number = <number> this.mapStatistics.ar;

        this.aim = this.baseValue(this.stars.aim);

        // Longer maps are worth more
        let lengthBonus = 0.95 + 0.4 * Math.min(1, objectCount / 2000);
        if (objectCount > 2000) {
            lengthBonus += Math.log10(objectCount / 2000) * 0.5;
        }

        this.aim *= lengthBonus;

        if (this.computedAccuracy.nmiss > 0) {
            // Penalize misses by assessing # of misses relative to the total # of objects. Default a 3% reduction for any # of misses.
            this.aim *= 0.97 * Math.pow(1 - Math.pow(this.computedAccuracy.nmiss / objectCount, 0.775), this.computedAccuracy.nmiss);
        }

        // Combo scaling
        this.aim *= this.comboPenalty;

        // AR scaling
        let arFactor: number = 0;
        if (calculatedAR > 10.33) {
            arFactor += calculatedAR - 10.33;
        } else if (calculatedAR < 8) {
            arFactor += 0.025 * (8 - calculatedAR);
        }

        const arTotalHitsFactor: number = 1 / (1 + Math.exp(-(0.007 * (objectCount - 400))));

        const arBonus: number = 1 + (0.03 + 0.37 * arTotalHitsFactor) * arFactor;

        // We want to give more reward for lower AR when it comes to aim and HD. This nerfs high AR and buffs lower AR.
        let hiddenBonus: number = 1;
        if (this.convertedMods & mods.osuMods.hd) {
            hiddenBonus += 0.04 * (12 - calculatedAR);
        }

        this.aim *= hiddenBonus;

        let flBonus: number = 1;
        if (this.convertedMods & mods.osuMods.fl) {
            // Apply object-based bonus for flashlight.
            flBonus += 0.35 * Math.min(1, objectCount / 200);
            if (objectCount > 200) {
                flBonus += 0.3 * Math.min(1, (objectCount - 200) / 300);
            }
            if (objectCount > 500) {
                flBonus += (objectCount - 500) / 1200;
            }
        }

        this.aim *= Math.max(arBonus, flBonus);

        // Scale the aim value with accuracy slightly.
        this.aim *= 0.5 + this.computedAccuracy.value(objectCount) / 2;

        // It is also important to consider accuracy difficulty when doing that.
        const odScaling: number = Math.pow(<number> this.mapStatistics.od, 2) / 2500;
        this.aim *= 0.98 + odScaling;
    }

    /**
     * Calculates the speed performance value of the beatmap.
     */
    protected calculateSpeedValue(): void {
        // Global variables
        const objectCount: number = this.stars.objects.length;
        const calculatedAR: number = <number> this.mapStatistics.ar;
        const n50: number = this.computedAccuracy.n50;

        this.speed = this.baseValue(this.stars.speed);

        // Longer maps are worth more
        let lengthBonus = 0.95 + 0.4 * Math.min(1, objectCount / 2000);
        if (objectCount > 2000) {
            lengthBonus += Math.log10(objectCount / 2000) * 0.5;
        }

        this.speed *= lengthBonus;

        if (this.computedAccuracy.nmiss > 0) {
            // Penalize misses by assessing # of misses relative to the total # of objects. Default a 3% reduction for any # of misses.
            this.speed *= 0.97 * Math.pow(1 - Math.pow(this.computedAccuracy.nmiss / objectCount, 0.775), Math.pow(this.computedAccuracy.nmiss, 0.875));
        }

        // Combo scaling
        this.speed *= this.comboPenalty;

        // AR scaling
        let arFactor: number = 0;
        if (calculatedAR > 10.33) {
            arFactor += calculatedAR - 10.33;
        }

        const arTotalHitsFactor: number = 1 / (1 + Math.exp(-(0.007 * (objectCount - 400))));

        this.speed *= 1 + (0.03 + 0.37 * arTotalHitsFactor) * arFactor;

        if (this.convertedMods & mods.osuMods.hd) {
            this.speed *= 1 + 0.04 * (12 - calculatedAR);
        }

        // Scale the speed value with accuracy and OD.
        this.speed *= (0.95 + Math.pow(<number> this.mapStatistics.od, 2) / 750) *
            Math.pow(
                this.computedAccuracy.value(objectCount),
                (14.5 - Math.max(<number> this.mapStatistics.od, 8)) / 2
            );

        // Scale the speed value with # of 50s to punish doubletapping.
        this.speed *= Math.pow(0.98, Math.max(0, n50 - objectCount / 500));
    }

    /**
     * Calculates the accuracy performance value of the beatmap.
     */
    protected calculateAccuracyValue(): void {
        // Global variables
        const n300: number = this.computedAccuracy.n300;
        const n100: number = this.computedAccuracy.n100;
        const n50: number = this.computedAccuracy.n50;

        const nobjects: number = this.stars.objects.length;
        const ncircles: number = this.convertedMods & mods.osuMods.v2 ? nobjects - this.stars.map.spinners : this.stars.map.circles;

        const realAccuracy: number = Math.max(
            ncircles > 0 ?
            ((n300 - (nobjects - ncircles)) * 6 + n100 * 2 + n50) / (ncircles * 6) :
            0,
            0
        );

        // Lots of arbitrary values from testing.
        // Considering to use derivation from perfect accuracy in a probabilistic manner - assume normal distribution
        this.accuracy = Math.pow(1.52163, <number> this.mapStatistics.od) *
            Math.pow(realAccuracy, 24) * 2.83;

        // Bonus for many hitcircles - it's harder to keep good accuracy up for longer
        this.accuracy *= Math.min(1.15, Math.pow(ncircles / 1000, 0.3));

        if (this.convertedMods & mods.osuMods.hd) {
            this.accuracy *= 1.08;
        }
        if (this.convertedMods & mods.osuMods.fl) {
            this.accuracy *= 1.02;
        }
    }

    toString(): string {
        return (
            this.total.toFixed(2) + " pp (" + this.aim.toFixed(2)
            + " aim, " + this.speed.toFixed(2) + " speed, "
            + this.accuracy.toFixed(2) + " acc)"
        );
    }
}