import { Accuracy } from '../utils/Accuracy';
import { modes } from '../constants/modes';
import { DroidStarRating } from './DroidStarRating';
import { MapStats } from '../utils/MapStats';
import { DroidHitWindow } from '../utils/HitWindow';
import { PerformanceCalculator } from './base/PerformanceCalculator';
import { ModHidden } from '../mods/ModHidden';
import { ModFlashlight } from '../mods/ModFlashlight';
import { ModScoreV2 } from '../mods/ModScoreV2';
import { ModPrecise } from '../mods/ModPrecise';
import { ModRelax } from '../mods/ModRelax';

/**
 * A performance points calculator that calculates performance points for osu!droid gamemode.
 */
export class DroidPerformanceCalculator extends PerformanceCalculator {
    override stars: DroidStarRating = new DroidStarRating();
    override finalMultiplier = 1.24;

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

    /**
     * The flashlight performance value.
     */
    flashlight: number = 0;

    private aggregatedRhythmMultiplier: number = 0;

    override calculate(params: {
        /**
         * The star rating instance to calculate.
         */
        stars: DroidStarRating,

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
         * The tap penalty to apply for penalized scores.
         */
        speedPenalty?: number,

        /**
         * Custom map statistics to apply custom tap multiplier and force AR values as well as old statistics.
         */
        stats?: MapStats
    }): this {
        this.handleParams(params, modes.droid);

        this.calculateAggregatedRhythmMultiplier();

        this.calculateAimValue();
        this.calculateSpeedValue();
        this.calculateAccuracyValue();
        this.calculateFlashlightValue();

        // Apply speed penalty for penalized plays.
        this.speed /= (params.speedPenalty ?? 1);

        this.total = Math.pow(
            Math.pow(this.aim, 1.1) + Math.pow(this.speed, 1.1) +
            Math.pow(this.accuracy, 1.1) + Math.pow(this.flashlight, 1.1),
            1 / 1.1
        ) * this.finalMultiplier;

        return this;
    }

    /**
     * Calculates the aggregated rhythm multiplier of the beatmap.
     */
    private calculateAggregatedRhythmMultiplier(): void {
        const rhythmMultipliers: number[] = this.stars.objects.map(v => v.rhythmMultiplier);

        const maxMultiplier: number = Math.max(...rhythmMultipliers);

        const aggregatedResult: number = rhythmMultipliers.reduce((total, next) => total + (1 / (1 + Math.exp(6 - next / maxMultiplier * 9))), 0);

        this.aggregatedRhythmMultiplier = aggregatedResult / rhythmMultipliers.length;
    }

    /**
     * Calculates the aim performance value of the beatmap.
     */
    private calculateAimValue(): void {
        // Global variables
        const objectCount: number = this.stars.objects.length;
        const calculatedAR: number = this.mapStatistics.ar!;

        this.aim = this.baseValue(Math.pow(this.stars.aim, 0.8));

        if (this.computedAccuracy.nmiss > 0) {
            // Penalize misses by assessing # of misses relative to the total # of objects. Default a 3% reduction for any # of misses.
            this.aim *= 0.97 * Math.pow(1 - Math.pow(this.computedAccuracy.nmiss / objectCount, 0.775), this.computedAccuracy.nmiss);
        }

        // Combo scaling
        this.aim *= this.comboPenalty;

        // We want to give more reward for lower AR when it comes to aim and HD. This nerfs high AR and buffs lower AR.
        let hiddenBonus: number = 1;
        if (this.stars.mods.some(m => m instanceof ModHidden)) {
            // The bonus starts decreasing twice as fast
            // beyond AR10 and reaches 1 at AR11.
            if (calculatedAR > 10) {
                hiddenBonus += Math.max(0, 0.08 * (11 - calculatedAR));
            } else {
                hiddenBonus += 0.04 * (12 - calculatedAR);
            }
        }
        this.aim *= hiddenBonus;

        // AR scaling
        let arFactor: number = 0;
        if (calculatedAR > 10.33) {
            arFactor += calculatedAR - 10.33;
        } else if (calculatedAR < 8) {
            arFactor += 0.025 * (8 - calculatedAR);
        }

        const arTotalHitsFactor: number = 1 / (1 + Math.exp(-(0.007 * (objectCount - 400))));

        this.aim *= 1 + (0.03 + 0.37 * arTotalHitsFactor) * arFactor;

        // Scale the aim value with accuracy slightly.
        this.aim *= 0.5 + this.computedAccuracy.value(objectCount) / 2;

        // It is also important to consider accuracy difficulty when doing that.
        const odScaling: number = Math.pow(this.mapStatistics.od!, 2) / 2500;
        this.aim *= 0.98 + (this.mapStatistics.od! >= 0 ? odScaling : -odScaling);
    }

    /**
     * Calculates the speed performance value of the beatmap.
     */
    private calculateSpeedValue(): void {
        // Global variables
        const objectCount: number = this.stars.objects.length;
        const calculatedAR: number = this.mapStatistics.ar!;

        this.speed = this.baseValue(this.stars.speed);

        if (this.computedAccuracy.nmiss > 0) {
            // Penalize misses by assessing # of misses relative to the total # of objects. Default a 3% reduction for any # of misses.
            this.speed *= 0.97 * Math.pow(1 - Math.pow(this.computedAccuracy.nmiss / objectCount, 0.775), Math.pow(this.computedAccuracy.nmiss, 0.875));
        }

        // Combo scaling
        this.speed *= this.comboPenalty;

        let arFactor: number = 0;
        if (calculatedAR > 10.33) {
            arFactor += calculatedAR - 10.33;
        }

        const arTotalHitsFactor: number = 1 / (1 + Math.exp(-(0.007 * (objectCount - 400))));

        this.speed *= 1 + (0.03 + 0.37 * arTotalHitsFactor) * arFactor;

        // Scale the speed value with accuracy and OD.
        const od: number = <number> this.mapStatistics.od;
        const odScaling: number = Math.pow(od, 2) / 750;
        this.speed *= (0.95 + (od > 0 ? odScaling : -odScaling)) *
            Math.pow(
                this.computedAccuracy.value(objectCount),
                (12 - Math.max(od, 2.5)) / 2
            );

        // Scale the speed value with # of 50s to punish doubletapping.
        this.speed *= Math.pow(0.98, Math.max(0, this.computedAccuracy.n50 - objectCount / 500));
    }

    /**
     * Calculates the accuracy performance value of the beatmap.
     */
    private calculateAccuracyValue(): void {
        if (this.stars.mods.some(m => m instanceof ModRelax)) {
            return;
        }

        // Global variables
        const ncircles: number = this.stars.mods.some(m => m instanceof ModScoreV2) ? this.stars.objects.length - this.stars.map.spinners : this.stars.map.circles;

        if (ncircles === 0) {
            return;
        }

        // We calculate a variance based on the object count and # of 50s, 100s, etc. This prevents us from having cases
        // where an SS on lower OD is actually worth more than a 95% on OD11, even though OD11 requires a greater window
        // of precision.
        const p100: number = this.computedAccuracy.n100 / ncircles;
        const p50: number = this.computedAccuracy.n50 / ncircles;
        const pm: number = this.computedAccuracy.nmiss / ncircles;
        const p300: number = Math.max(0, 1 - pm - p50 - p100);

        // Convert converted droid OD back to original droid OD first before calculating variance.
        let droidMS: number = 50 - 6 * (this.mapStatistics.od! - 5);
        const isPrecise: boolean = this.stars.mods.some(m => m instanceof ModPrecise);
        const od: number = 5 - (droidMS - (isPrecise ? 55 : 75)) / (isPrecise ? 6 : 5);

        const hitWindow: DroidHitWindow = new DroidHitWindow(od);

        const m300: number = hitWindow.hitWindowFor300(isPrecise);
        const m100: number = hitWindow.hitWindowFor100(isPrecise);
        const m50: number = hitWindow.hitWindowFor50(isPrecise);

        const variance: number = p300 * Math.pow(m300 / 2, 2) +
            p100 * Math.pow((m300 + m100) / 2, 2) +
            p50 * Math.pow((m100 + m50) / 2, 2);

        this.accuracy = Math.pow(1.45, (79.5 - 2 * Math.sqrt(variance)) / 6) * 10;

        // Scale the accuracy value with rhythm complexity.
        this.accuracy *= Math.pow(Math.exp(this.aggregatedRhythmMultiplier - 1), 0.85);

        // Scale the accuracy value with amount of accuracy objects (objects that
        // depends on hit window for hit result).
        this.accuracy *= Math.sqrt(Math.log(1 + (Math.E - 1) * Math.min(ncircles, 1600) / 1000));

        if (this.stars.mods.some(m => m instanceof ModHidden)) {
            this.accuracy *= 1.08;
        }

        if (this.stars.mods.some(m => m instanceof ModFlashlight)) {
            this.accuracy *= 1.02;
        }
    }

    /**
     * Calculates the flashlight performance value of the beatmap.
     */
    private calculateFlashlightValue(): void {
        if (!this.stars.mods.some(m => m instanceof ModFlashlight)) {
            return;
        }

        // Global variables
        const objectCount: number = this.stars.objects.length;

        this.flashlight = Math.pow(
            Math.pow(this.stars.flashlight, 0.8),
            2
        ) * 25;

        // Add an additional bonus for HDFL.
        if (this.stars.mods.some(m => m instanceof ModHidden)) {
            this.flashlight *= 1.3;
        }

        // Combo scaling
        this.flashlight *= this.comboPenalty;

        if (this.computedAccuracy.nmiss > 0) {
            // Penalize misses by assessing # of misses relative to the total # of objects. Default a 3% reduction for any # of misses.
            this.flashlight *= 0.97 * Math.pow(1 - Math.pow(this.computedAccuracy.nmiss / objectCount, 0.775), Math.pow(this.computedAccuracy.nmiss, 0.875));
        }

        // Account for shorter maps having a higher ratio of 0 combo/100 combo flashlight radius.
        this.flashlight *= 0.7 + 0.1 * Math.min(1, objectCount / 200) +
            (objectCount > 200 ? 0.2 * Math.min(1, (objectCount - 200) / 200) : 0);

        // Scale the aim value with accuracy slightly.
        this.flashlight *= 0.5 + this.computedAccuracy.value(objectCount) / 2;

        // It is also important to consider accuracy difficulty when doing that.
        const odScaling: number = Math.pow(this.mapStatistics.od!, 2) / 2500;
        this.flashlight *= 0.98 + (this.mapStatistics.od! >= 0 ? odScaling : -odScaling);
    }

    override toString(): string {
        return (
            this.total.toFixed(2) + " pp (" + this.aim.toFixed(2)
            + " aim, " + this.speed.toFixed(2) + " speed, "
            + this.accuracy.toFixed(2) + " acc, " + this.flashlight.toFixed(2) + " flashlight)"
        );
    }
}