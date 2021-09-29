import { Beatmap } from '../beatmap/Beatmap';
import { modes } from '../constants/modes';
import { MapStats } from '../utils/MapStats';
import { OsuAim } from './skills/OsuAim';
import { OsuSpeed } from './skills/OsuSpeed';
import { StarRating } from './base/StarRating';
import { OsuSkill } from './skills/OsuSkill';
import { ModTouchDevice } from '../mods/ModTouchDevice';
import { Mod } from '../mods/Mod';
import { OsuFlashlight } from './skills/OsuFlashlight';
import { ModFlashlight } from '../mods/ModFlashlight';
import { OsuHitWindow } from '../utils/HitWindow';

/**
 * Difficulty calculator for osu!standard gamemode.
 */
export class OsuStarRating extends StarRating {
    /**
     * The aim star rating of the beatmap.
     */
    aim: number = 0;

    /**
     * The speed star rating of the beatmap.
     */
    speed: number = 0;

    /**
     * The flashlight star rating of the beatmap.
     */
    flashlight: number = 0;

    protected readonly difficultyMultiplier: number = 0.0675;

    calculate(params: {
        /**
         * The beatmap to calculate.
         */
        map: Beatmap,

        /**
         * Applied modifications.
         */
        mods?: Mod[],

        /**
         * Custom map statistics to apply custom speed multiplier as well as old statistics.
         */
        stats?: MapStats
    }): this {
        return super.calculate(params, modes.osu);
    }

    /**
     * Calculates the aim star rating of the beatmap and stores it in this instance.
     */
    calculateAim(): void {
        const aimSkill: OsuAim = new OsuAim(this.mods);

        this.calculateSkills(aimSkill);

        this.aimStrainPeaks = aimSkill.strainPeaks;

        this.aim = this.starValue(aimSkill.difficultyValue());

        if (this.mods.some(m => m instanceof ModTouchDevice)) {
            this.aim = Math.pow(this.aim, 0.8);
        }
    }

    /**
     * Calculates the speed star rating of the beatmap and stores it in this instance.
     */
    calculateSpeed(): void {
        const speedSkill: OsuSpeed = new OsuSpeed(
            this.mods,
            new OsuHitWindow(this.stats.od!).hitWindowFor300()
        );

        this.calculateSkills(speedSkill);

        this.speedStrainPeaks = speedSkill.strainPeaks;

        this.speed = this.starValue(speedSkill.difficultyValue());
    }

    /**
     * Calculates the flashlight star rating of the beatmap and stores it in this instance.
     */
    calculateFlashlight(): void {
        const flashlightSkill: OsuFlashlight = new OsuFlashlight(this.mods);

        this.calculateSkills(flashlightSkill);

        this.flashlightStrainPeaks = flashlightSkill.strainPeaks;

        this.flashlight = this.starValue(flashlightSkill.difficultyValue());
    }

    /**
     * Calculates the total star rating of the beatmap and stores it in this instance.
     */
    calculateTotal(): void {
        const aimPerformanceValue: number = this.basePerformanceValue(this.aim);
        const speedPerformanceValue: number = this.basePerformanceValue(this.speed);
        let flashlightPerformanceValue: number = 0;

        if (this.mods.some(m => m instanceof ModFlashlight)) {
            flashlightPerformanceValue = Math.pow(this.flashlight, 2) * 25;
        }

        const basePerformanceValue: number = Math.pow(
            Math.pow(aimPerformanceValue, 1.1) +
            Math.pow(speedPerformanceValue, 1.1) +
            Math.pow(flashlightPerformanceValue, 1.1),
            1 / 1.1
        );

        if (basePerformanceValue > 1e-5) {
            this.total = Math.cbrt(1.12) * 0.027 * (Math.cbrt(100000 / Math.pow(2, 1 / 1.1) * basePerformanceValue) + 4);
        }
    }

    /**
     * Calculates every star rating of the beatmap and stores it in this instance.
     */
    calculateAll(): void {
        const skills: OsuSkill[] = this.createSkills();

        this.calculateSkills(...skills);

        const aimSkill: OsuAim = <OsuAim> skills[0];
        const speedSkill: OsuSpeed = <OsuSpeed> skills[1];
        const flashlightSkill: OsuFlashlight = <OsuFlashlight> skills[2];

        this.aimStrainPeaks = aimSkill.strainPeaks;
        this.speedStrainPeaks = speedSkill.strainPeaks;
        this.flashlightStrainPeaks = flashlightSkill.strainPeaks;

        this.aim = this.starValue(aimSkill.difficultyValue());
        this.speed = this.starValue(speedSkill.difficultyValue());
        this.flashlight = this.starValue(flashlightSkill.difficultyValue());

        if (this.mods.some(m => m instanceof ModTouchDevice)) {
            this.aim = Math.pow(this.aim, 0.8);
        }

        this.calculateTotal();
    }

    /**
     * Returns a string representative of the class.
     */
    toString(): string {
        return (
            this.total.toFixed(2) + " stars (" + this.aim.toFixed(2) +
            " aim, " + this.speed.toFixed(2) + " speed, " +
            this.flashlight.toFixed(2) + " flashlight)"
        );
    }

    /**
     * Creates skills to be calculated.
     */
    protected createSkills(): OsuSkill[] {
        return [
            new OsuAim(this.mods),
            new OsuSpeed(
                this.mods,
                new OsuHitWindow(this.stats.od!).hitWindowFor300()
            ),
            new OsuFlashlight(this.mods)
        ];
    }
}