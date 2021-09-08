import { Beatmap } from '../beatmap/Beatmap';
import { modes } from '../constants/modes';
import { MapStats } from '../utils/MapStats';
import { DroidAim } from './skills/DroidAim';
import { DroidSpeed } from './skills/DroidSpeed';
import { DroidRhythm } from './skills/DroidRhythm';
import { StarRating } from './base/StarRating';
import { DroidSkill } from './skills/DroidSkill';
import { Mod } from '../mods/Mod';

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

    protected readonly difficultyMultiplier: number = 0.0675;

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
        const aimSkill: DroidAim = new DroidAim();

        this.calculateSkills(aimSkill);

        this.aimStrainPeaks = aimSkill.strainPeaks;

        this.aim = Math.pow(this.starValue(aimSkill.difficultyValue()), 0.8);
    }

    /**
     * Calculates the tap star rating of the beatmap and stores it in this instance.
     */
    calculateSpeed(): void {
        const speedSkill: DroidSpeed = new DroidSpeed();

        this.calculateSkills(speedSkill);

        this.speedStrainPeaks = speedSkill.strainPeaks;

        this.speed = this.starValue(speedSkill.difficultyValue());
    }

    calculateRhythm(): void {
        const rhythmSkill: DroidRhythm = new DroidRhythm();

        this.calculateSkills(rhythmSkill);

        this.rhythm = this.starValue(rhythmSkill.difficultyValue());
    }

    /**
     * Calculates the total star rating of the beatmap and stores it in this instance.
     */
    calculateTotal(): void {
        this.total = this.aim + this.speed + Math.pow(this.rhythm, 0.4);
    }

    /**
     * Calculates every star rating of the beatmap and stores it in this instance.
     */
    calculateAll(): void {
        const skills: DroidSkill[] = this.createSkills();

        this.calculateSkills(...skills);

        const aimSkill: DroidAim = <DroidAim> skills[0];
        const speedSkill: DroidSpeed = <DroidSpeed> skills[1];
        const rhythmSkill: DroidRhythm = <DroidRhythm> skills[2];

        this.aimStrainPeaks = aimSkill.strainPeaks;
        this.speedStrainPeaks = speedSkill.strainPeaks;

        this.aim = Math.pow(this.starValue(aimSkill.difficultyValue()), 0.8);

        this.speed = this.starValue(speedSkill.difficultyValue());

        this.rhythm = this.starValue(rhythmSkill.difficultyValue());

        this.calculateTotal();
    }

    /**
     * Returns a string representative of the class.
     */
    toString(): string {
        return (
            this.total.toFixed(2) + " stars (" + this.aim.toFixed(2) +
            " aim, " + this.speed.toFixed(2) + " speed, " +
            this.rhythm.toFixed(2) + " rhythm)"
        );
    }

    /**
     * Creates skills to be calculated.
     */
    protected createSkills(): DroidSkill[] {
        return [
            new DroidAim(),
            new DroidSpeed(),
            new DroidRhythm()
        ];
    }
}