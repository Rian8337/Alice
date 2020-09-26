import { Accuracy } from '../utils/Accuracy';
import { modes } from '../constants/modes';
import { StandardDiff } from './StandardDiff';
import { MapStats } from '../utils/MapStats';
import { mods } from '../utils/mods';

/**
 * A performance points calculator that calculates performance points for osu!standard gamemode.
 */
export class PerformanceCalculator {
    /**
     * The aim performance value.
     */
    public aim: number;

    /**
     * The speed performance value.
     */
    public speed: number;
    
    /**
     * The accuracy performance value.
     */
    public accuracy: number;

    /**
     * The overall performance value.
     */
    public total: number;

    /**
     * The calculated accuracy.
     */
    public computedAccuracy?: Accuracy;

    /**
     * The mode this calculator is calculating for.
     */
    public mode?: modes;

    /**
     * The speed penalty for osu!droid based on replay analyzer.
     */
    private speedPenalty: number;

    /**
     * Bitwise value of enabled modifications.
     */
    private convertedMods: number;

    /**
     * The calculated beatmap.
     */
    private stars: StandardDiff;

    /**
     * The map statistics after applying modifications.
     */
    private mapStatistics?: MapStats;

    /**
     * Overall length bonus.
     */
    private lengthBonus: number;

    /**
     * Penalty for misses.
     */
    private missPenalty: number;

    /**
     * Penalty for combo breaks.
     */
    private comboPenalty: number;

    /**
     * Bonus for specific AR values.
     */
    private arBonus: number;

    /**
     * Bonus that is given if Hidden mod is applied.
     */
    private hiddenBonus: number;

    constructor() {
        this.aim = 0;
        this.speed = 0;
        this.accuracy = 0;
        this.total = 0;

        this.speedPenalty = 1;
        this.convertedMods = 0;
        this.lengthBonus = 0;
        this.missPenalty = 0;
        this.comboPenalty = 0;
        this.arBonus = 0;
        this.hiddenBonus = 0;

        this.stars = new StandardDiff();
        this.computedAccuracy = undefined;
        this.mapStatistics = undefined;
    }

    /**
     * Calculates the performance points of a beatmap.
     */
    calculate(params: {
        stars: StandardDiff,
        combo?: number,
        accPercent?: number,
        miss?: number,
        mode?: modes,
        mods?: string,
        speedPenalty?: number,
        stats?: MapStats
    }): PerformanceCalculator {
        this.mode = params.mode || modes.osu;
        this.stars = params.stars;
        this.speedPenalty = params.speedPenalty || 1;
        if (!this.stars) {
            throw new Error("params.stars must be in StandardDiff instance");
        }

        let miss: number = params.miss || 0;
        let maxCombo: number = this.stars.map?.maxCombo() as number;
        let combo: number = params.combo || maxCombo - miss;
        let mod = this.stars.mods;
        this.convertedMods = mods.modbitsFromString(mod);
        let baseAR: number = this.stars.map?.ar as number;
        let baseOD: number = this.stars.map?.od as number;

        this.computedAccuracy = new Accuracy({
            percent: params.accPercent,
            nobjects: this.stars.objects.length,
            nmiss: miss
        });

        this.mapStatistics = new MapStats({
            ar: baseAR,
            od: baseOD,
            mods: mod
        });

        if (params.stats) {
            this.mapStatistics.ar = params.stats.ar || this.mapStatistics.ar;
            this.mapStatistics.isForceAR = params.stats.isForceAR || this.mapStatistics.isForceAR;
            this.mapStatistics.speedMultiplier = params.stats.speedMultiplier || this.mapStatistics.speedMultiplier;
        }

        this.mapStatistics = this.mapStatistics.calculate({mode: this.mode});

        this.missPenalty = Math.pow(0.97, miss);
        this.comboPenalty = Math.min(Math.pow(combo, 0.8) / Math.pow(maxCombo, 0.8), 1);
        
        let arBonus: number = 1;
        const calculatedAR: number = this.mapStatistics.ar as number;
        if (calculatedAR > 10.33) {
            arBonus += 0.3 * (calculatedAR - 10.33);
        } else if (calculatedAR < 8) {
            arBonus += 0.01 * (8 - calculatedAR);
        }
        this.arBonus = arBonus;

        let hiddenBonus = 1;
        if (this.convertedMods & mods.osuMods.hd) {
            hiddenBonus *= 1 + 0.04 * (12 - calculatedAR);
        }
        this.hiddenBonus = hiddenBonus;

        const objectCount: number = this.stars.objects.length;
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

        // slight buff to final value for droid
        let finalMultiplier: number = this.mode === modes.droid ? 1.15 : 1.12;
        if (this.convertedMods & mods.osuMods.nf) {
            finalMultiplier *= 0.9;
        }
        if (this.convertedMods & mods.osuMods.so) {
            finalMultiplier *= 0.95;
        }

        if (this.mode === modes.droid) {
            // Extreme penalty
            // =======================================================
            // added to penaltize map with little aim but ridiculously
            // high speed value (which is easily abusable by using more than 2 fingers)
            let extremePenalty = Math.pow(
                1 - Math.abs(this.speed - Math.pow(this.aim, 1.1)) /
                Math.max(this.speed, Math.pow(this.aim, 1.1)),
                0.2
            );
            extremePenalty = Math.max(
                Math.pow(extremePenalty, 2),
                -2 * Math.pow(1 - extremePenalty, 2) + 1
            );
            finalMultiplier *= extremePenalty;
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
        aimValue *= this.lengthBonus * this.missPenalty * this.comboPenalty * this.arBonus * this.hiddenBonus;

        if (this.convertedMods & mods.osuMods.fl) {
            const objectCount: number = this.stars.objects.length;
            let flBonus: number = 1 + 0.35 * Math.min(1, objectCount / 200);
            if (objectCount > 200) {
                flBonus += 0.3 * Math.min(1, (objectCount - 200) / 300);
            }
            if (objectCount > 500) {
                flBonus += (objectCount - 500) / 1200;
            }
            aimValue *= flBonus;
        }

        // accuracy bonus
        aimValue *= 0.5 + (this.computedAccuracy?.value() as number) / 2;

        // OD bonus
        aimValue *= 0.98 + Math.pow(this.mapStatistics?.od as number, 2) / 2500;

        this.aim = aimValue;
    }

    /**
     * Calculates the speed performance value of the beatmap.
     */
    private calculateSpeedValue(): void {
        let speedValue: number = this.baseValue(this.stars.speed);
        speedValue *= this.lengthBonus * this.missPenalty * this.comboPenalty * this.hiddenBonus;
        if (this.mapStatistics?.ar as number > 10.33) {
            speedValue *= this.arBonus;
        }

        // accuracy bonus
        speedValue *= 0.02 + (this.computedAccuracy?.value() as number);

        // OD bonus
        speedValue *= 0.96 + Math.pow(this.mapStatistics?.od as number, 2) / 1600;

        // apply speed penalty for droid plays
        if (this.mode === modes.droid) {
            speedValue /= this.speedPenalty;
        }

        this.speed = speedValue;
    }

    /**
     * Calculates the accuracy performance value of the beatmap.
     */
    private calculateAccuracyValue(): void {
        const n300: number = this.computedAccuracy?.n300 as number;
        const n100: number = this.computedAccuracy?.n100 as number;
        const n50: number = this.computedAccuracy?.n50 as number;

        const nobjects: number = n300 + n100 + n50 + (this.computedAccuracy?.nmiss as number);
        const ncircles: number = this.stars.map?.circles as number;

        let realAccuracy: number = Math.max(
            ncircles > 0 ?
            ((n300 - (nobjects - ncircles)) * 6 + n100 * 2 + n50) / (ncircles * 6) :
            0,
            0
        );

        let accuracyValue: number = this.mode === modes.droid ?
            // drastically change acc calculation to fit droid meta
            Math.pow(1.4, this.mapStatistics?.od as number) *
            Math.pow(Math.max(1, this.mapStatistics?.ar as number / 10), 3) *
            Math.pow(realAccuracy, 12) * 10
            :
            Math.pow(1.52163, this.mapStatistics?.od as number) *
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
     * Calculates the base performance value for stars.
     */
    private baseValue(stars: number) {
        return Math.pow(5 * Math.max(1, stars / 0.0675) - 4, 3) / 100000;
    }
}