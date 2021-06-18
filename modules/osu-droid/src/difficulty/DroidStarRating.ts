import { Beatmap } from '../beatmap/Beatmap';
import { modes } from '../constants/modes';
import { MapStats } from '../utils/MapStats';
import { DroidAim } from './skills/DroidAim';
import { DroidTap } from './skills/DroidTap';
import { DroidRhythm } from './skills/DroidRhythm';
import { StarRating } from './base/StarRating';
import { DroidSkill } from './skills/DroidSkill';

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
    private readonly displayDifficultyMultiplier: number = 0.605;

    private displayAim: number = 0;
    private displayTap: number = 0;

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
        mods?: string,

        /**
         * Custom map statistics to apply custom tap multiplier as well as old statistics.
         */
        stats?: MapStats
    }): this {
        return super.calculate(params, modes.droid);
    }

    /**
     * Calculates the skills provided.
     * 
     * @param skills The skills to calculate.
     */
    calculateSkills(...skills: DroidSkill[]): void {
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
        const aimSkill: DroidAim = new DroidAim();

        this.calculateSkills(aimSkill);

        this.aimStrainPeaks = aimSkill.strains;

        this.aim = this.baseRatingValue(aimSkill.difficultyValue());
        this.displayAim = this.baseDisplayRatingValue(aimSkill.displayDifficultyValue());
    }

    /**
     * Calculates the tap star rating of the beatmap and stores it in this instance.
     */
    calculateTap(): void {
        const tapSkill: DroidTap = new DroidTap();

        this.calculateSkills(tapSkill);

        this.speedStrainPeaks = tapSkill.strains;

        this.tap = this.baseRatingValue(tapSkill.difficultyValue());
        this.displayTap = this.baseDisplayRatingValue(tapSkill.displayDifficultyValue());
    }

    calculateRhythm(): void {
        const rhythmSkill: DroidRhythm = new DroidRhythm();

        this.calculateSkills(rhythmSkill);

        this.rhythm = this.baseRatingValue(rhythmSkill.difficultyValue());
    }

    /**
     * Calculates the total star rating of the beatmap and stores it in this instance.
     */
    calculateTotal(): void {
        const displayAimPerformance: number = this.basePerformanceValue(this.displayAim);
        const displayTapPerformance: number = this.basePerformanceValue(this.displayTap);

        const totalPerformance: number = Math.pow(
            Math.pow(displayAimPerformance, 1.1) +
            Math.pow(displayTapPerformance, 1.1),
            1 / 1.1
        );

        this.total = 0.027 * (Math.cbrt(100000 / Math.pow(2, 1 / 1.1) * totalPerformance) + 4);
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
        this.displayAim = this.baseDisplayRatingValue(aimSkill.displayDifficultyValue());

        this.tap = this.baseRatingValue(tapSkill.difficultyValue());
        this.displayTap = this.baseDisplayRatingValue(tapSkill.displayDifficultyValue());

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
            new DroidAim(),
            new DroidTap(),
            new DroidRhythm()
        ];
    }

    /**
     * Calculates the base rating value of a difficulty.
     */
    private baseRatingValue(difficulty: number): number {
        return Math.pow(difficulty, 0.75) * this.difficultyMultiplier;
    }

    /**
     * Calculates the base display rating value of a difficulty.
     */
    private baseDisplayRatingValue(difficulty: number): number {
        return Math.pow(difficulty, 0.75) * this.displayDifficultyMultiplier;
    }

    /**
     * Calculates the base performance value of a star rating.
     */
    private basePerformanceValue(stars: number): number {
        return Math.pow(5 * Math.max(1, stars) - 4, 3) / 100000;
    }
}