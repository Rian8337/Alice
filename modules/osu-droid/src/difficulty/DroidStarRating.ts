import { Beatmap } from '../beatmap/Beatmap';
import { modes } from '../constants/modes';
import { MapStats } from '../utils/MapStats';
import { DroidAim } from './skills/DroidAim';
import { DroidTap } from './skills/DroidTap';
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
    tap: number = 0;

    /**
     * The rhythm star rating of the beatmap.
     */
    rhythm: number = 0;

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
         * Applied modifications in osu!standard format.
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

        this.aimStrainPeaks = aimSkill.strains;

        this.aim = this.baseRatingValue(aimSkill.difficultyValue());
    }

    /**
     * Calculates the tap star rating of the beatmap and stores it in this instance.
     */
    calculateTap(): void {
        const tapSkill: DroidTap = new DroidTap(this.mods);

        this.calculateSkills(tapSkill);

        this.speedStrainPeaks = tapSkill.strains;

        this.tap = this.baseRatingValue(tapSkill.difficultyValue());
    }

    calculateRhythm(): void {
        const rhythmSkill: DroidRhythm = new DroidRhythm(this.mods);

        this.calculateSkills(rhythmSkill);

        this.rhythm = this.baseRatingValue(rhythmSkill.difficultyValue());
    }

    /**
     * Calculates the total star rating of the beatmap and stores it in this instance.
     */
    calculateTotal(): void {
        this.total = this.aim + this.tap + Math.pow(this.rhythm, 0.4);
    }

    /**
     * Calculates every star rating of the beatmap and stores it in this instance.
     */
    calculateAll(): void {
        const skills: DroidSkill[] = this.createSkills();

        this.calculateSkills(...skills);

        const aimSkill: DroidAim = <DroidAim> skills[0];
        const tapSkill: DroidTap = <DroidTap> skills[1];
        const rhythmSkill: DroidRhythm = <DroidRhythm> skills[2];

        this.aimStrainPeaks = aimSkill.strains;
        this.speedStrainPeaks = tapSkill.strains;

        this.aim = this.baseRatingValue(aimSkill.difficultyValue());

        this.tap = this.baseRatingValue(tapSkill.difficultyValue());

        this.rhythm = this.baseRatingValue(rhythmSkill.difficultyValue());

        this.calculateTotal();
    }

    /**
     * Returns a string representative of the class.
     */
    toString(): string {
        return (
            this.total.toFixed(2) + " stars (" + this.aim.toFixed(2) +
            " aim, " + this.tap.toFixed(2) + " tap, " +
            this.rhythm.toFixed(2) + " rhythm)"
        );
    }

    /**
     * Creates skills to be calculated.
     */
    protected createSkills(): DroidSkill[] {
        return [
            new DroidAim(this.mods),
            new DroidTap(this.mods),
            new DroidRhythm(this.mods)
        ];
    }

    /**
     * Calculates the base rating value of a difficulty.
     */
    private baseRatingValue(difficulty: number): number {
        return Math.pow(difficulty, 0.75) * this.difficultyMultiplier;
    }
}