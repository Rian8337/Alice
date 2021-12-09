import { Accuracy } from "../utils/Accuracy";
import { modes } from "../constants/modes";
import { DroidStarRating } from "./DroidStarRating";
import { MapStats } from "../utils/MapStats";
import { PerformanceCalculator } from "./base/PerformanceCalculator";
import { ModHidden } from "../mods/ModHidden";
import { ModFlashlight } from "../mods/ModFlashlight";
import { ModScoreV2 } from "../mods/ModScoreV2";
import { ModRelax } from "../mods/ModRelax";

/**
 * A performance points calculator that calculates performance points for osu!droid gamemode.
 */
export class DroidPerformanceCalculator extends PerformanceCalculator {
    override stars: DroidStarRating = new DroidStarRating();
    protected override finalMultiplier = 1.42;

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

    /**
     * The flashlight performance value.
     */
    flashlight: number = 0;

    private aggregatedRhythmMultiplier: number = 0;

    override calculate(params: {
        /**
         * The star rating instance to calculate.
         */
        stars: DroidStarRating;

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
         * The tap penalty to apply for penalized scores.
         */
        tapPenalty?: number;

        /**
         * Custom map statistics to apply custom tap multiplier and force AR values as well as old statistics.
         */
        stats?: MapStats;
    }): this {
        this.handleParams(params, modes.droid);

        this.calculateAverageRhythmMultiplier();

        this.calculateAimValue();
        this.calculateTapValue();
        this.calculateAccuracyValue();
        this.calculateFlashlightValue();

        // Apply tap penalty for penalized plays.
        this.tap /= params.tapPenalty ?? 1;

        this.total =
            Math.pow(
                Math.pow(this.aim, 1.1) +
                    Math.pow(this.tap, 1.1) +
                    Math.pow(this.accuracy, 1.1) +
                    Math.pow(this.flashlight, 1.1),
                1 / 1.1
            ) * this.finalMultiplier;

        return this;
    }

    /**
     * Calculates the average rhythm multiplier of the beatmap.
     */
    private calculateAverageRhythmMultiplier(): void {
        // The first object doesn't have any rhythm multiplier, so we begin with the second object
        const rhythmMultipliers: number[] = this.stars.objects
            .map((v) => v.rhythmMultiplier)
            .slice(1);

        this.aggregatedRhythmMultiplier = Math.max(
            1,
            rhythmMultipliers.reduce((total, value) => total + value, 0) /
                Math.max(500, rhythmMultipliers.length)
        );
    }

    /**
     * Calculates the aim performance value of the beatmap.
     */
    private calculateAimValue(): void {
        // Global variables
        const objectCount: number = this.stars.objects.length;
        const calculatedAR: number = this.mapStatistics.ar!;

        this.aim = this.baseValue(Math.pow(this.stars.aim, 0.8));

        if (this.effectiveMissCount > 0) {
            // Penalize misses by assessing # of misses relative to the total # of objects. Default a 3% reduction for any # of misses.
            this.aim *=
                0.97 *
                Math.pow(
                    1 - Math.pow(this.effectiveMissCount / objectCount, 0.775),
                    this.effectiveMissCount
                );
        }

        // Combo scaling
        this.aim *= this.comboPenalty;

        // We want to give more reward for lower AR when it comes to aim and HD. This nerfs high AR and buffs lower AR.
        let hiddenBonus: number = 1;
        if (this.stars.mods.some((m) => m instanceof ModHidden)) {
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
            arFactor += 0.3 * (calculatedAR - 10.33);
        } else if (calculatedAR < 8) {
            arFactor += 0.1 * (8 - calculatedAR);
        }

        // Buff for longer maps with high AR.
        this.aim *=
            1 +
            arFactor *
                (1.650668 +
                    (0.4845796 - 1.650668) /
                        (1 + Math.pow(objectCount / 817.9306, 1.147469)));

        // Scale the aim value with slider factor to nerf very likely dropped sliderends.
        this.aim *= this.sliderNerfFactor;

        // Scale the aim value with accuracy.
        this.aim *= this.computedAccuracy.value(objectCount);

        // It is also important to consider accuracy difficulty when doing that.
        const odScaling: number = Math.pow(this.mapStatistics.od!, 2) / 2500;
        this.aim *=
            0.98 + (this.mapStatistics.od! >= 0 ? odScaling : -odScaling);
    }

    /**
     * Calculates the tap performance value of the beatmap.
     */
    private calculateTapValue(): void {
        // Global variables
        const objectCount: number = this.stars.objects.length;
        const calculatedAR: number = this.mapStatistics.ar!;

        this.tap = this.baseValue(this.stars.tap);

        if (this.effectiveMissCount > 0) {
            // Penalize misses by assessing # of misses relative to the total # of objects. Default a 3% reduction for any # of misses.
            this.tap *=
                0.97 *
                Math.pow(
                    1 - Math.pow(this.effectiveMissCount / objectCount, 0.775),
                    Math.pow(this.effectiveMissCount, 0.875)
                );
        }

        // Combo scaling
        this.tap *= this.comboPenalty;

        // AR scaling
        if (calculatedAR > 10.33) {
            // Buff for longer maps with high AR.
            this.tap *=
                1 +
                0.3 *
                    (calculatedAR - 10.33) *
                    (1.650668 +
                        (0.4845796 - 1.650668) /
                            (1 + Math.pow(objectCount / 817.9306, 1.147469)));
        }

        // Calculate accuracy assuming the worst case scenario.
        const countGreat: number = this.computedAccuracy.n300;
        const countOk: number = this.computedAccuracy.n100;
        const countMeh: number = this.computedAccuracy.n50;

        const relevantTotalDiff: number =
            objectCount - this.stars.attributes.speedNoteCount;

        const relevantAccuracy: Accuracy = new Accuracy({
            n300: Math.max(0, countGreat - relevantTotalDiff),
            n100: Math.max(
                0,
                countOk - Math.max(0, relevantTotalDiff - countGreat)
            ),
            n50: Math.max(
                0,
                countMeh - Math.max(0, relevantTotalDiff - countGreat - countOk)
            ),
            nmiss: this.effectiveMissCount,
        });

        // Scale the speed value with accuracy and OD.
        const od: number = this.mapStatistics.od!;
        const odScaling: number = Math.pow(od, 2) / 750;
        this.tap *=
            (0.95 + (od > 0 ? odScaling : -odScaling)) *
            Math.pow(
                (this.computedAccuracy.value(objectCount) +
                    relevantAccuracy.value(
                        this.stars.attributes.speedNoteCount
                    )) /
                    2,
                (12 - Math.max(od, 2.5)) / 2
            );

        // Scale the speed value with # of 50s to punish doubletapping.
        this.tap *= Math.pow(
            0.98,
            Math.max(0, this.computedAccuracy.n50 - objectCount / 500)
        );
    }

    /**
     * Calculates the accuracy performance value of the beatmap.
     */
    private calculateAccuracyValue(): void {
        if (this.stars.mods.some((m) => m instanceof ModRelax)) {
            return;
        }

        // Global variables
        const ncircles: number = this.stars.mods.some(
            (m) => m instanceof ModScoreV2
        )
            ? this.stars.objects.length - this.stars.map.spinners
            : this.stars.map.circles;

        if (ncircles === 0) {
            return;
        }

        const realAccuracy: Accuracy = new Accuracy({
            ...this.computedAccuracy,
            n300:
                this.computedAccuracy.n300 -
                (this.stars.objects.length - ncircles),
        });

        // Lots of arbitrary values from testing.
        // Considering to use derivation from perfect accuracy in a probabilistic manner - assume normal distribution
        this.accuracy =
            Math.pow(1.4, this.mapStatistics.od!) *
            Math.pow(realAccuracy.value(ncircles), 12) *
            10;

        // Bonus for many hitcircles - it's harder to keep good accuracy up for longer
        this.accuracy *= Math.min(1.15, Math.pow(ncircles / 1000, 0.3));

        // Scale the accuracy value with rhythm complexity.
        this.accuracy *= Math.min(
            1,
            Math.pow(Math.exp(this.aggregatedRhythmMultiplier - 0.5), 0.85) / 2
        );

        if (this.stars.mods.some((m) => m instanceof ModHidden)) {
            this.accuracy *= 1.08;
        }

        if (this.stars.mods.some((m) => m instanceof ModFlashlight)) {
            this.accuracy *= 1.02;
        }
    }

    /**
     * Calculates the flashlight performance value of the beatmap.
     */
    private calculateFlashlightValue(): void {
        if (!this.stars.mods.some((m) => m instanceof ModFlashlight)) {
            return;
        }

        // Global variables
        const objectCount: number = this.stars.objects.length;

        this.flashlight =
            Math.pow(Math.pow(this.stars.flashlight, 0.8), 2) * 25;

        // Add an additional bonus for HDFL.
        if (this.stars.mods.some((m) => m instanceof ModHidden)) {
            this.flashlight *= 1.3;
        }

        // Combo scaling
        this.flashlight *= this.comboPenalty;

        if (this.effectiveMissCount > 0) {
            // Penalize misses by assessing # of misses relative to the total # of objects. Default a 3% reduction for any # of misses.
            this.flashlight *=
                0.97 *
                Math.pow(
                    1 - Math.pow(this.effectiveMissCount / objectCount, 0.775),
                    Math.pow(this.effectiveMissCount, 0.875)
                );
        }

        // Account for shorter maps having a higher ratio of 0 combo/100 combo flashlight radius.
        this.flashlight *=
            0.7 +
            0.1 * Math.min(1, objectCount / 200) +
            (objectCount > 200
                ? 0.2 * Math.min(1, (objectCount - 200) / 200)
                : 0);

        // Scale the flashlight value with accuracy slightly.
        this.flashlight *= 0.5 + this.computedAccuracy.value(objectCount) / 2;

        // It is also important to consider accuracy difficulty when doing that.
        const odScaling: number = Math.pow(this.mapStatistics.od!, 2) / 2500;
        this.flashlight *=
            0.98 + (this.mapStatistics.od! >= 0 ? odScaling : -odScaling);
    }

    override toString(): string {
        return (
            this.total.toFixed(2) +
            " pp (" +
            this.aim.toFixed(2) +
            " aim, " +
            this.tap.toFixed(2) +
            " tap, " +
            this.accuracy.toFixed(2) +
            " acc, " +
            this.flashlight.toFixed(2) +
            " flashlight)"
        );
    }
}
