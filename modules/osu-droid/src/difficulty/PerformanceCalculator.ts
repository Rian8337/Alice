import { Accuracy } from '../utils/Accuracy';
import { modes } from '../constants/modes';
import { StarRating } from './StarRating';
import { MapStats } from '../utils/MapStats';
import { mods } from '../utils/mods';

/**
 * A performance points calculator that calculates performance points for osu!standard gamemode.
 */
export class PerformanceCalculator {
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
     * The overall performance value.
     */
    total: number = 0;

    /**
     * The calculated accuracy.
     */
    computedAccuracy: Accuracy = new Accuracy({});

    /**
     * The mode this calculator is calculating for.
     */
    mode: modes = modes.osu;

    /**
     * Bitwise value of enabled modifications.
     */
    private convertedMods: number = 0;

    /**
     * The calculated beatmap.
     */
    private stars: StarRating = new StarRating();

    /**
     * The map statistics after applying modifications.
     */
    private mapStatistics: MapStats = new MapStats();

    /**
     * Overall length bonus.
     */
    private lengthBonus: number = 0;

    /**
     * Penalty for misses for aim.
     */
    private aimMissPenalty: number = 0;

    /**
     * Penalty for misses for speed.
     */
    private speedMissPenalty: number = 0;

    /**
     * Penalty for combo breaks.
     */
    private comboPenalty: number = 0;

    /**
     * Bonus for specific AR values.
     */
    private droidARBonus: number = 0;

    /**
     * Bonus for specific AR values.
     */
    private osuARBonus: number = 0;

    /**
     * Bonus that is given if Hidden mod is applied.
     */
    private hiddenBonus: number = 0;

    /**
     * Calculates the performance points of a beatmap.
     */
    calculate(params: {
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
    }): PerformanceCalculator {
        this.mode = params.mode || modes.osu;
        this.stars = params.stars;
        if (!(this.stars instanceof StarRating)) {
            throw new Error("params.stars must be in StarRating instance");
        }
        
        const maxCombo: number = this.stars.map.maxCombo();
        const mod: string = this.stars.mods;
        this.convertedMods = mods.modbitsFromString(mod);
        const baseAR: number = this.stars.map.ar as number;
        const baseOD: number = this.stars.map.od;
        const objectCount: number = this.stars.objects.length;

        if (params.accPercent instanceof Accuracy) {
            this.computedAccuracy = params.accPercent;
        } else {
            this.computedAccuracy = new Accuracy({
                percent: params.accPercent,
                nobjects: this.stars.objects.length,
                nmiss: params.miss || 0
            });
        }
        const miss: number = this.computedAccuracy.nmiss;
        const combo: number = params.combo || maxCombo - miss;

        this.mapStatistics = new MapStats({
            ar: baseAR,
            od: baseOD,
            mods: mod
        });

        if (params.stats) {
            this.mapStatistics.ar = params.stats.ar || this.mapStatistics.ar;
            this.mapStatistics.isForceAR = params.stats.isForceAR || this.mapStatistics.isForceAR;
            this.mapStatistics.speedMultiplier = params.stats.speedMultiplier || this.mapStatistics.speedMultiplier;
            this.mapStatistics.oldStatistics = params.stats.oldStatistics || this.mapStatistics.oldStatistics;
        }

        this.mapStatistics.calculate({mode: this.mode});

        // Penalize misses by assessing # of misses relative to the total # of objects. Default a 3% reduction for any # of misses.
        this.aimMissPenalty = 0.97 * Math.pow(1 - Math.pow(miss / objectCount, 0.775), miss);
        this.speedMissPenalty = 0.97 * Math.pow(1 - Math.pow(miss / objectCount, 0.775), Math.pow(miss, 0.875));
        this.comboPenalty = Math.min(Math.pow(combo / maxCombo, 0.8), 1);
        
        let arBonus: number = 0;
        const calculatedAR: number = this.mapStatistics.ar as number;
        if (calculatedAR > 10.33) {
            arBonus += 0.4 * (calculatedAR - 10.33);
        } else if (calculatedAR < 8) {
            arBonus += 0.01 * (8 - calculatedAR);
        }
        // Change droid AR bonus to keep consistency with length-related values.
        this.droidARBonus = 1 + Math.min(arBonus, arBonus * objectCount / 1250);
        this.osuARBonus = 1 + Math.min(arBonus, arBonus * objectCount / 1000);

        let hiddenBonus: number = 1;
        if (this.convertedMods & mods.osuMods.hd) {
            switch (this.mode) {
                case modes.droid:
                    // The bonus starts decreasing twice as fast
                    // beyond AR10 and reaches 1 at AR11.
                    if (calculatedAR > 10) {
                        hiddenBonus += Math.max(0, 0.08 * (11 - calculatedAR));
                    } else {
                        hiddenBonus += 0.04 * (12 - calculatedAR);
                    }
                    break;
                case modes.osu:
                    hiddenBonus += 0.04 * (12 - calculatedAR);
            }
        }
        this.hiddenBonus = hiddenBonus;

        const objectsOver2000: number = objectCount / 2000;
        let lengthBonus = 0.95 + 0.4 * Math.min(1, objectsOver2000);
        switch (this.mode) {
            case modes.droid:
                lengthBonus = 1.650668 +
                    (0.4845796 - 1.650668) /
                    (1 + Math.pow(objectCount / 817.9306, 1.147469));
                break;
            case modes.osu:
                if (objectCount > 2000) {
                    lengthBonus += Math.log10(objectsOver2000) * 0.5;
                }
        }
        this.lengthBonus = lengthBonus;

        this.calculateAimValue();
        this.calculateSpeedValue();
        this.calculateAccuracyValue();

        // Custom multiplier for SO and NF.
        // This is being adjusted to keep the final pp value scaled around what it used to be when changing things.
        let finalMultiplier: number = this.mode === modes.droid ? 1.24 : 1.12;
        if (this.convertedMods & mods.osuMods.nf) {
            finalMultiplier *= Math.max(0.9, 1 - 0.02 * miss);
        }
        if (this.convertedMods & mods.osuMods.so) {
            finalMultiplier *= 1 - Math.pow(this.stars.map.spinners / objectCount, 0.85);
        }

        if (this.mode === modes.droid && (this.aim || this.speed)) {
            // Extreme penalty
            // =======================================================
            // added to penalize map with little aim but ridiculously
            // high speed value (which is easily abusable by using more than 2 fingers).
            let extremePenalty = Math.pow(
                1 - Math.abs(this.speed - Math.pow(this.aim, 1.15)) /
                Math.max(this.speed, Math.pow(this.aim, 1.15)),
                0.2
            );
            extremePenalty = Math.max(
                Math.pow(extremePenalty, 2),
                -2 * Math.pow(1 - extremePenalty, 2) + 1
            );
            finalMultiplier *= extremePenalty;
        }

        // Apply speed penalty for droid plays.
        if (this.mode === modes.droid) {
            this.speed /= (params.speedPenalty ?? 1);
        }

        this.total = Math.pow(
            Math.pow(this.aim, 1.1) + Math.pow(this.speed, 1.1) +
            Math.pow(this.accuracy, 1.1),
            1 / 1.1
        ) * finalMultiplier;

        return this;
    }

    /**
     * Returns a string representative of the class.
     */
    toString(): string {
        return (
            this.total.toFixed(2) + " pp (" + this.aim.toFixed(2)
            + " aim, " + this.speed.toFixed(2) + " speed, "
            + this.accuracy.toFixed(2) + " acc)"
        );
    }

    /**
     * Calculates the aim performance value of the beatmap.
     */
    private calculateAimValue(): void {
        let aimValue: number = this.baseValue(this.stars.aim);
        aimValue *= this.lengthBonus * this.comboPenalty * this.hiddenBonus;
        if (this.computedAccuracy.nmiss > 0) {
            aimValue *= this.aimMissPenalty;
        }

        switch (this.mode) {
            case modes.droid:
                aimValue *= this.droidARBonus;
                break;
            case modes.osu:
                aimValue *= this.osuARBonus;
                break;
        }

        const objectCount: number = this.stars.objects.length;
        if (this.convertedMods & mods.osuMods.fl) {
            // Apply object-based bonus for flashlight.
            let flBonus: number = 1 + 0.35 * Math.min(1, objectCount / 200);
            if (objectCount > 200) {
                flBonus += 0.3 * Math.min(1, (objectCount - 200) / 300);
            }
            if (objectCount > 500) {
                flBonus += (objectCount - 500) / 1200;
            }
            aimValue *= flBonus;
        }

        // Scale the aim value with accuracy slightly.
        aimValue *= 0.5 + this.computedAccuracy.value(objectCount) / 2;

        // It is also important to consider accuracy difficulty when doing that.
        const odScaling: number = Math.pow(this.mapStatistics.od as number, 2) / 2500;
        aimValue *= 0.98 + (this.mapStatistics.od as number >= 0 ? odScaling : -odScaling);

        this.aim = aimValue;
    }

    /**
     * Calculates the speed performance value of the beatmap.
     */
    private calculateSpeedValue(): void {
        let speedValue: number = this.baseValue(this.stars.speed);
        speedValue *= this.lengthBonus * this.comboPenalty * this.hiddenBonus;

        if (this.computedAccuracy.nmiss > 0) {
            speedValue *= this.speedMissPenalty;
        }

        if (this.mapStatistics.ar as number > 10.33) {
            switch (this.mode) {
                case modes.droid:
                    speedValue *= this.droidARBonus;
                    break;
                case modes.osu:
                    speedValue *= this.osuARBonus;
                    break;
            }
        }

        // Scale the speed value with accuracy and OD.
        const odScaling: number = Math.pow(this.mapStatistics.od as number, 2) / 750;
        const objectCount: number = this.stars.objects.length;
        speedValue *=
            (0.95 + (this.mapStatistics.od as number > 0 ? odScaling : -odScaling)) *
            Math.pow(
                this.computedAccuracy.value(objectCount),
                ((this.mode === modes.droid ? 12 : 14.5) - Math.max(this.mapStatistics.od as number, this.mode === modes.droid ? 2.5 : 8)) / 2 // Change minimum threshold for droid to OD7 droid
            );

        // Scale the speed value with # of 50s to punish doubletapping.
        const n50: number = this.computedAccuracy.n50;
        speedValue *= Math.pow(0.98, Math.max(0, n50 - objectCount / 500));

        this.speed = speedValue;
    }

    /**
     * Calculates the accuracy performance value of the beatmap.
     */
    private calculateAccuracyValue(): void {
        const n300: number = this.computedAccuracy.n300;
        const n100: number = this.computedAccuracy.n100;
        const n50: number = this.computedAccuracy.n50;

        const nobjects: number = this.stars.objects.length;
        const ncircles: number = this.stars.map.circles;

        const realAccuracy: number = Math.max(
            ncircles > 0 ?
            ((n300 - (nobjects - ncircles)) * 6 + n100 * 2 + n50) / (ncircles * 6) :
            0,
            0
        );

        let accuracyValue: number = this.mode === modes.droid ?
            // Drastically change acc calculation to fit droid meta.
            // It is harder to get good accuracy with touchscreen, especially in small hit window.
            Math.pow(1.4, this.mapStatistics.od as number) *
            Math.pow(Math.max(1, this.mapStatistics.ar as number / 10), 3) *
            Math.pow(realAccuracy, 12) * 10
            :
            Math.pow(1.52163, this.mapStatistics.od as number) *
            Math.pow(realAccuracy, 24) * 2.83;
        
        accuracyValue *= Math.min(1.15, Math.pow(ncircles / 1000, 0.3));

        if (this.convertedMods & mods.osuMods.hd) {
            accuracyValue *= 1.08;
        }
        if (this.convertedMods & mods.osuMods.fl) {
            accuracyValue *= 1.02;
        }
        
        this.accuracy = accuracyValue;
    }

    /**
     * Calculates the base performance value for of a star rating.
     */
    private baseValue(stars: number): number {
        return Math.pow(5 * Math.max(1, stars / 0.0675) - 4, 3) / 100000;
    }
}