import { Beatmap } from '../beatmap/Beatmap';
import { modes } from '../constants/modes';
import { MapStats } from '../utils/MapStats';
import { DroidAim } from './skills/DroidAim';
import { DroidSpeed } from './skills/DroidSpeed';
import { DroidRhythm } from './skills/DroidRhythm';
import { StarRating } from './base/StarRating';
import { DroidSkill } from './skills/DroidSkill';
import { Mod } from '../mods/Mod';
import { DroidFlashlight } from './skills/DroidFlashlight';
import { ModFlashlight } from '../mods/ModFlashlight';
import { OsuHitWindow } from '../utils/HitWindow';
import { ModRelax } from '../mods/ModRelax';

/**
 * Difficulty calculator for osu!droid gamemode.
 */
export class DroidStarRating extends StarRating {
    /**
     * The aim star rating of the beatmap.
     */
    aim: number = 0;

    /**
     * The tap star rating of the beatmap.
     */
    speed: number = 0;

    /**
     * The rhythm star rating of the beatmap.
     */
    rhythm: number = 0;

    /**
     * The flashlight star rating of the beatmap.
     */
    flashlight: number = 0;

    protected readonly difficultyMultiplier: number = 0.18;

    /**
     * Calculates the star rating of the specified beatmap.
     * 
     * The beatmap is analyzed in chunks of `sectionLength` duration.
     * For each chunk the highest hitobject strains are added to
     * a list which is then collapsed into a weighted sum, much
     * like scores are weighted on a user's profile.
     * 
     * For subsequent chunks, the initial max strain is calculated
     * by decaying the previous hitobject's strain until the
     * beginning of the new chunk.
     * 
     * The first object doesn't generate a strain
     * so we begin calculating from the second object.
     * 
     * Also don't forget to manually add the peak strain for the last
     * section which would otherwise be ignored.
     */
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
         * Custom map statistics to apply custom tap multiplier as well as old statistics.
         */
        stats?: MapStats
    }): this {
        return super.calculate(params, modes.droid);
    }

    /**
     * Calculates the aim star rating of the beatmap and stores it in this instance.
     */
    calculateAim(): void {
        const aimSkill: DroidAim = new DroidAim(this.mods);

        this.calculateSkills(aimSkill);

        this.aimStrainPeaks = aimSkill.strainPeaks;

        this.aim = this.starValue(aimSkill.difficultyValue());
    }

    /**
     * Calculates the speed star rating of the beatmap and stores it in this instance.
     */
    calculateSpeed(): void {
        if (this.mods.some(m => m instanceof ModRelax)) {
            return;
        }

        const speedSkill: DroidSpeed = new DroidSpeed(
            this.mods,
            new OsuHitWindow(this.stats.od!).hitWindowFor300()
        );

        this.calculateSkills(speedSkill);

        this.speedStrainPeaks = speedSkill.strainPeaks;

        this.speed = this.starValue(speedSkill.difficultyValue());

        const objectStrains: number[] = this.objects.map(v => v.speedStrain);

        const maxStrain: number = Math.max(...objectStrains);

        this.attributes.speedNoteCount = objectStrains.reduce(
            (total, next) => total + (1 / (1 + Math.exp(-(next / maxStrain * 12 - 6)))),
            0
        );
    }

    /**
     * Calculates the rhythm star rating of the beatmap and stores it in this instance.
     */
    calculateRhythm(): void {
        if (this.mods.some(m => m instanceof ModRelax)) {
            return;
        }

        const rhythmSkill: DroidRhythm = new DroidRhythm(
            this.mods,
            new OsuHitWindow(this.stats.od!).hitWindowFor300()
        );

        this.calculateSkills(rhythmSkill);

        this.rhythm = this.starValue(rhythmSkill.difficultyValue());
    }

    /**
     * Calculates the flashlight star rating of the beatmap and stores it in this instance.
     */
    calculateFlashlight(): void {
        const flashlightSkill: DroidFlashlight = new DroidFlashlight(this.mods);

        this.calculateSkills(flashlightSkill);

        this.flashlightStrainPeaks = flashlightSkill.strainPeaks;

        this.flashlight = this.starValue(flashlightSkill.difficultyValue());
    }

    calculateTotal(): void {
        const aimPerformanceValue: number = this.basePerformanceValue(this.aim);
        const speedPerformanceValue: number = this.basePerformanceValue(this.speed);
        const flashlightPerformanceValue: number =
            this.mods.some(m => m instanceof ModFlashlight) ? 
            Math.pow(this.flashlight, 2) * 25 :
            0;

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

    calculateAll(): void {
        const skills: DroidSkill[] = this.createSkills();

        const isRelax: boolean = this.mods.some(m => m instanceof ModRelax);

        if (isRelax) {
            // Remove speed and rhythm skill to prevent overhead
            skills.splice(1, 2);
        }

        this.calculateSkills(...skills);

        const aimSkill: DroidAim = <DroidAim> skills[0];
        let speedSkill: DroidSpeed | undefined;
        let rhythmSkill: DroidRhythm | undefined;

        if (!isRelax) {
            speedSkill = <DroidSpeed> skills[1];
            rhythmSkill = <DroidRhythm> skills[2];
        }

        this.aimStrainPeaks = aimSkill.strainPeaks;
        this.aim = this.starValue(aimSkill.difficultyValue());

        if (speedSkill) {
            this.speedStrainPeaks = speedSkill.strainPeaks;

            this.speed = this.starValue(speedSkill.difficultyValue());

            const objectStrains: number[] = this.objects.map(v => v.speedStrain);

            const maxStrain: number = Math.max(...objectStrains);

            this.attributes.speedNoteCount = objectStrains.reduce(
                (total, next) => total + (1 / (1 + Math.exp(-(next / maxStrain * 12 - 6)))),
                0
            );
        }

        if (rhythmSkill) {
            this.rhythm = this.starValue(rhythmSkill.difficultyValue());
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
            this.rhythm.toFixed(2) + " rhythm, " +
            this.flashlight.toFixed(2) + " flashlight)"
        );
    }

    /**
     * Creates skills to be calculated.
     */
    protected createSkills(): DroidSkill[] {
        const greatWindow: number = new OsuHitWindow(this.stats.od!).hitWindowFor300();

        return [
            new DroidAim(this.mods),
            new DroidSpeed(
                this.mods,
                greatWindow
            ),
            new DroidRhythm(
                this.mods,
                greatWindow
            ),
            new DroidFlashlight(this.mods)
        ];
    }
}