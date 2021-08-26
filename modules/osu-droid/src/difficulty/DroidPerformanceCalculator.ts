import { Accuracy } from '../utils/Accuracy';
import { modes } from '../constants/modes';
import { DroidStarRating } from './DroidStarRating';
import { MapStats } from '../utils/MapStats';
import { OsuHitWindow } from '../utils/HitWindow';
import { PerformanceCalculator } from './base/PerformanceCalculator';
import { ModNoFail } from '../mods/ModNoFail';
import { ModSpunOut } from '../mods/ModSpunOut';
import { ModHidden } from '../mods/ModHidden';
import { ModFlashlight } from '../mods/ModFlashlight';
import { ModScoreV2 } from '../mods/ModScoreV2';

/**
 * A performance points calculator that calculates performance points for osu!droid gamemode.
 */
export class DroidPerformanceCalculator extends PerformanceCalculator {
    stars: DroidStarRating = new DroidStarRating();

    /**
     * The aim performance value.
     */
    aim: number = 0;

    /**
     * The tap performance value.
     */
    tap: number = 0;
    
    /**
     * The accuracy performance value.
     */
    accuracy: number = 0;

    calculate(params: {
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
        tapPenalty?: number,

        /**
         * Custom map statistics to apply custom tap multiplier and force AR values as well as old statistics.
         */
        stats?: MapStats
    }): this {
        this.handleParams(params, modes.droid);

        const objectCount: number = this.stars.objects.length;
        const maxCombo: number = this.stars.map.maxCombo();
        const miss: number = this.computedAccuracy.nmiss;
        const combo: number = params.combo || maxCombo - miss;

        // Penalize misses by assessing # of misses relative to the total # of objects. Default a 3% reduction for any # of misses.
        this.comboPenalty = Math.min(Math.pow(combo / maxCombo, 0.8), 1);

        this.calculateAimValue();
        this.calculateTapValue();
        this.calculateAccuracyValue();

        // Custom multiplier for SO and NF.
        // This is being adjusted to keep the final pp value scaled around what it used to be when changing things.
        let finalMultiplier: number = 1.24;
        if (this.stars.mods.some(m => m instanceof ModNoFail)) {
            finalMultiplier *= Math.max(0.9, 1 - 0.02 * miss);
        }
        if (this.stars.mods.some(m => m instanceof ModSpunOut)) {
            finalMultiplier *= 1 - Math.pow(this.stars.map.spinners / objectCount, 0.85);
        }

        // Apply tap penalty for penalized plays.
        this.tap /= (params.tapPenalty ?? 1);

        this.total = Math.pow(
            Math.pow(this.aim, 1.1) + Math.pow(this.tap, 1.1) +
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

        let arFactor: number = 0;
        if (calculatedAR > 10.33) {
            arFactor = 0.15 * (calculatedAR - 10.33);
        } else if (calculatedAR < 8) {
            arFactor = 0.05 * (8 - calculatedAR);
        }

        // Scale aim with AR, sensitive to object count.
        this.aim *= 1 + arFactor * (0.33 + 0.66 * Math.min(1, objectCount / 1250));

        if (this.stars.mods.some(m => m instanceof ModFlashlight)) {
            // Apply object-based bonus for flashlight.
            let flBonus: number = 1 + 0.25 * Math.min(1, objectCount / 200);
            if (objectCount > 200) {
                flBonus += 0.3 * Math.min(1, (objectCount - 200) / 300);
            }
            if (objectCount > 500) {
                flBonus += (objectCount - 500) / 1200;
            }
            this.aim *= flBonus;
        }

        if (this.stars.mods.some(m => m instanceof ModHidden) && this.stars.mods.some(m => m instanceof ModFlashlight)) {
            this.aim *= 1.2;
        }

        // Scale the aim value with accuracy slightly.
        this.aim *= 0.5 + this.computedAccuracy.value(objectCount) / 2;

        // It is also important to consider accuracy difficulty when doing that.
        const odScaling: number = Math.pow(<number> this.mapStatistics.od, 2) / 2500;
        this.aim *= 0.98 + (<number> this.mapStatistics.od >= 0 ? odScaling : -odScaling);
    }

    /**
     * Calculates the tap performance value of the beatmap.
     */
    protected calculateTapValue(): void {
        // Global variables
        const objectCount: number = this.stars.objects.length;
        const calculatedAR: number = <number> this.mapStatistics.ar;
        const n50: number = this.computedAccuracy.n50;

        this.tap = this.baseValue(this.stars.tap);

        if (this.computedAccuracy.nmiss > 0) {
            // Penalize misses by assessing # of misses relative to the total # of objects. Default a 3% reduction for any # of misses.
            this.tap *= 0.97 * Math.pow(1 - Math.pow(this.computedAccuracy.nmiss / objectCount, 0.775), Math.pow(this.computedAccuracy.nmiss, 0.875));
        }

        // Combo scaling
        this.tap *= this.comboPenalty;

        // Scale tap sensitive to AR, without respect to object count.
        if (calculatedAR > 10.33) {
            this.tap *= 1 + 0.3 * (calculatedAR - 10.33);
        }

        // Scale the tap value with accuracy and OD.
        const od: number = <number> this.mapStatistics.od;
        const odScaling: number = Math.pow(od, 2) / 750;
        this.tap *= (0.95 + (od > 0 ? odScaling : -odScaling)) *
            Math.pow(
                this.computedAccuracy.value(objectCount),
                12 - Math.max(od, 2.5) / 2
            );

        // Scale the tap value with # of 50s to punish doubletapping.
        this.tap *= Math.pow(0.98, Math.max(0, n50 - objectCount / 500));
    }

    /**
     * Calculates the accuracy performance value of the beatmap.
     */
    protected calculateAccuracyValue(): void {
        // Global variables
        const ncircles: number = this.stars.mods.some(m => m instanceof ModScoreV2) ? this.stars.objects.length - this.stars.map.spinners : this.stars.map.circles;

        if (ncircles === 0) {
            return;
        }

        // Drastically change acc calculation to fit droid meta.

        // We calculate a variance based on the object count and # of 50s, 100s, etc. This prevents us from having cases
        // where an SS on lower OD is actually worth more than a 95% on OD11, even though OD11 requires a greater window
        // of precision.

        const p100: number = this.computedAccuracy.n100 / ncircles;
        const p50: number = this.computedAccuracy.n50 / ncircles;
        const pm: number = this.computedAccuracy.nmiss / ncircles;
        const p300: number = 1 - pm - p50 - p100;

        const hitWindow: OsuHitWindow = new OsuHitWindow(<number> this.mapStatistics.od);
        const m300: number = hitWindow.hitWindowFor300();
        const m100: number = hitWindow.hitWindowFor100();
        const m50: number = hitWindow.hitWindowFor50();

        const variance: number = p300 * Math.pow(m300 / 2, 2) +
            p100 * Math.pow((m300 + m100) / 2, 2) +
            p50 * Math.pow((m100 + m50) / 2, 2) +
            pm * Math.pow(229.5 - 11 * <number> this.mapStatistics.od, 2);

        this.accuracy = Math.pow(1.45, (79.5 - 2 * Math.sqrt(variance)) / 6) * 10;

        // Scale the accuracy value with rhythm complexity.
        const rhythmScaling: number = Math.pow(Math.exp(this.stars.rhythm - 1), 0.75);
        this.accuracy *= rhythmScaling;

        // Scale the accuracy value with amount of accuracy objects (objects that
        // depends on hit window for hit result)
        const lengthScaling: number = Math.sqrt(Math.log(1 + (Math.E - 1) * Math.min(ncircles, 2400) / 1500));
        this.accuracy *= lengthScaling;

        if (this.stars.mods.some(m => m instanceof ModHidden)) {
            this.accuracy *= 1.08;
        }

        if (this.stars.mods.some(m => m instanceof ModFlashlight)) {
            this.accuracy *= 1.02;
        }
    }

    toString(): string {
        return (
            this.total.toFixed(2) + " pp (" + this.aim.toFixed(2)
            + " aim, " + this.tap.toFixed(2) + " tap, "
            + this.accuracy.toFixed(2) + " acc)"
        );
    }
}