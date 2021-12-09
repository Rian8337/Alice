import { Beatmap } from "../beatmap/Beatmap";
import { modes } from "../constants/modes";
import { MapStats } from "../utils/MapStats";
import { OsuAim } from "./skills/OsuAim";
import { OsuSpeed } from "./skills/OsuSpeed";
import { StarRating } from "./base/StarRating";
import { OsuSkill } from "./skills/OsuSkill";
import { Mod } from "../mods/Mod";
import { OsuFlashlight } from "./skills/OsuFlashlight";
import { ModFlashlight } from "../mods/ModFlashlight";
import { OsuHitWindow } from "../utils/HitWindow";
import { ModRelax } from "../mods/ModRelax";

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

    protected override readonly difficultyMultiplier: number = 0.0675;

    override calculate(params: {
        /**
         * The beatmap to calculate.
         */
        map: Beatmap;

        /**
         * Applied modifications.
         */
        mods?: Mod[];

        /**
         * Custom map statistics to apply custom speed multiplier as well as old statistics.
         */
        stats?: MapStats;
    }): this {
        return super.calculate(params, modes.osu);
    }

    /**
     * Calculates the aim star rating of the beatmap and stores it in this instance.
     */
    calculateAim(): void {
        const aimSkill: OsuAim = new OsuAim(this.mods, true);
        const aimSkillWithoutSliders: OsuAim = new OsuAim(this.mods, false);

        this.calculateSkills(aimSkill);

        this.aimStrainPeaks = aimSkill.strainPeaks;

        this.aim = this.starValue(aimSkill.difficultyValue());

        if (this.aim) {
            this.attributes.sliderFactor =
                this.starValue(aimSkillWithoutSliders.difficultyValue()) /
                this.aim;
        }
    }

    /**
     * Calculates the speed star rating of the beatmap and stores it in this instance.
     */
    calculateSpeed(): void {
        if (this.mods.some((m) => m instanceof ModRelax)) {
            return;
        }

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

    override calculateTotal(): void {
        const aimPerformanceValue: number = this.basePerformanceValue(this.aim);
        const speedPerformanceValue: number = this.basePerformanceValue(
            this.speed
        );
        let flashlightPerformanceValue: number = 0;

        if (this.mods.some((m) => m instanceof ModFlashlight)) {
            flashlightPerformanceValue = Math.pow(this.flashlight, 2) * 25;
        }

        const basePerformanceValue: number = Math.pow(
            Math.pow(aimPerformanceValue, 1.1) +
                Math.pow(speedPerformanceValue, 1.1) +
                Math.pow(flashlightPerformanceValue, 1.1),
            1 / 1.1
        );

        if (basePerformanceValue > 1e-5) {
            this.total =
                Math.cbrt(1.12) *
                0.027 *
                (Math.cbrt(
                    (100000 / Math.pow(2, 1 / 1.1)) * basePerformanceValue
                ) +
                    4);
        }
    }

    override calculateAll(): void {
        const skills: OsuSkill[] = this.createSkills();

        const isRelax: boolean = this.mods.some((m) => m instanceof ModRelax);

        if (isRelax) {
            // Remove speed skill to prevent overhead
            skills.splice(2, 1);
        }

        this.calculateSkills(...skills);

        const aimSkill: OsuAim = <OsuAim>skills[0];
        const aimSkillWithoutSliders: OsuAim = <OsuAim>skills[1];
        let speedSkill: OsuSpeed | undefined;
        let flashlightSkill: OsuFlashlight;

        if (isRelax) {
            flashlightSkill = <OsuFlashlight>skills[2];
        } else {
            speedSkill = <OsuSpeed>skills[2];
            flashlightSkill = <OsuFlashlight>skills[3];
        }

        this.aimStrainPeaks = aimSkill.strainPeaks;
        this.aim = this.starValue(aimSkill.difficultyValue());

        if (this.aim) {
            this.attributes.sliderFactor =
                this.starValue(aimSkillWithoutSliders.difficultyValue()) /
                this.aim;
        }

        if (speedSkill) {
            this.speedStrainPeaks = speedSkill.strainPeaks;
            this.speed = this.starValue(speedSkill.difficultyValue());
        }

        this.flashlightStrainPeaks = flashlightSkill.strainPeaks;
        this.flashlight = this.starValue(flashlightSkill.difficultyValue());

        this.calculateTotal();
    }

    /**
     * Returns a string representative of the class.
     */
    override toString(): string {
        return (
            this.total.toFixed(2) +
            " stars (" +
            this.aim.toFixed(2) +
            " aim, " +
            this.speed.toFixed(2) +
            " speed, " +
            this.flashlight.toFixed(2) +
            " flashlight)"
        );
    }

    /**
     * Creates skills to be calculated.
     */
    protected override createSkills(): OsuSkill[] {
        return [
            new OsuAim(this.mods, true),
            new OsuAim(this.mods, false),
            new OsuSpeed(
                this.mods,
                new OsuHitWindow(this.stats.od!).hitWindowFor300()
            ),
            new OsuFlashlight(this.mods),
        ];
    }
}
