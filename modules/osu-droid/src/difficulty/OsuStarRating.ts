import { Beatmap } from '../beatmap/Beatmap';
import { modes } from '../constants/modes';
import { MapStats } from '../utils/MapStats';
import { OsuAim } from './skills/OsuAim';
import { OsuSpeed } from './skills/OsuSpeed';
import { StarRating } from './base/StarRating';
import { OsuSkill } from './skills/OsuSkill';

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

    protected readonly difficultyMultiplier: number = 0.0675;

    calculate(params: {
        /**
         * The beatmap to calculate.
         */
        map: Beatmap,

        /**
         * Applied modifications in osu!standard format.
         */
        mods?: string,

        /**
         * Custom map statistics to apply custom speed multiplier as well as old statistics.
         */
        stats?: MapStats
    }): this {
        return super.calculate(params, modes.osu);
    }

    /**
     * Calculates the skills provided.
     * 
     * @param skills The skills to calculate.
     */
    calculateSkills(...skills: OsuSkill[]): void {
        this.objects.slice(1).forEach(h => {
            skills.forEach(skill => {
                skill.processInternal(h);
            });
        });
    }

    /**
     * Calculates the aim star rating of the beatmap and stores it in this instance.
     */
    calculateAim(): void {
        const aimSkill: OsuAim = new OsuAim();

        this.calculateSkills(aimSkill);

        this.aimStrainPeaks = aimSkill.strainPeaks;

        this.aim = this.starValue(aimSkill.difficultyValue());

        if (this.mods.includes("TD")) {
            this.aim = Math.pow(this.aim, 0.8);
        }
    }

    /**
     * Calculates the speed star rating of the beatmap and stores it in this instance.
     */
    calculateSpeed(): void {
        const speedSkill: OsuSpeed = new OsuSpeed();

        this.calculateSkills(speedSkill);

        this.speedStrainPeaks = speedSkill.strainPeaks;

        this.speed = this.starValue(speedSkill.difficultyValue());
    }

    /**
     * Calculates the total star rating of the beatmap and stores it in this instance.
     */
    calculateTotal(): void {
        // Total stars mixes speed and aim in such a way that
        // heavily aim or speed focused maps get a bonus
        this.total = this.aim + this.speed + Math.abs(this.speed - this.aim) * 0.5;
    }

    /**
     * Calculates every star rating of the beatmap and stores it in this instance.
     */
    calculateAll(): void {
        const skills: OsuSkill[] = this.createSkills();

        this.calculateSkills(...skills);

        const aimSkill: OsuAim = <OsuAim> skills[0];
        const speedSkill: OsuSpeed = <OsuSpeed> skills[1];

        this.aimStrainPeaks = aimSkill.strainPeaks;
        this.speedStrainPeaks = speedSkill.strainPeaks;

        this.aim = this.starValue(aimSkill.difficultyValue());
        this.speed = this.starValue(speedSkill.difficultyValue());

        if (this.mods.includes("TD")) {
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
            " aim, " + this.speed.toFixed(2) + " speed)"
        );
    }

    /**
     * Creates skills to be calculated.
     */
    protected createSkills(): OsuSkill[] {
        return [
            new OsuAim(),
            new OsuSpeed()
        ];
    }

    /**
     * Calculates the star rating value of a difficulty.
     * 
     * @param difficulty The difficulty to calculate.
     */
    private starValue(difficulty: number): number {
        return Math.sqrt(difficulty) * this.difficultyMultiplier;
    }
}