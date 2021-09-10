import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { Skill } from "../base/Skill";

/**
 * Used to processes strain values of difficulty hitobjects, keep track of strain levels caused by the processed objects
 * and to calculate a final difficulty value representing the difficulty of hitting all the processed objects.
 */
export abstract class DroidSkill extends Skill {
    /**
     * The strain of currently calculated hitobject.
     */
    protected currentStrain: number = 1;

    /**
     * The current section's strain peak.
     */
    private currentSectionPeak: number = 1;

    /**
     * Strain peaks are stored here.
     */
    readonly strainPeaks: number[] = [];

    /**
     * Strain values are multiplied by this number for the given skill. Used to balance the value of different skills between each other.
     */
    protected abstract readonly skillMultiplier: number;

    /**
     * Determines how quickly strain decays for the given skill.
     * 
     * For example, a value of 0.15 indicates that strain decays to 15% of its original value in one second.
     */
    protected abstract readonly strainDecayBase: number;

    /**
     * The bonus multiplier that is given for a sequence of notes of equal difficulty.
     */
    protected abstract readonly starsPerDouble: number;

    private readonly sectionLength: number = 400;

    private currentSectionEnd: number = 1;

    /**
     * Calculates the strain value of a hitobject and stores the value in it. This value is affected by previously processed objects.
     * 
     * @param current The hitobject to process.
     */
    protected process(current: DifficultyHitObject): void {
        // The first object doesn't generate a strain, so we begin with an incremented section end
        if (this.previous.length === 0) {
            this.currentSectionEnd = Math.ceil(current.startTime / this.sectionLength) * this.sectionLength;
        }

        while (current.startTime > this.currentSectionEnd) {
            this.saveCurrentPeak();
            this.startNewSectionFrom(this.currentSectionEnd);
            this.currentSectionEnd += this.sectionLength;
        }

        this.currentStrain = this.strainValueAt(current);

        this.saveToHitObject(current);

        this.currentSectionPeak = Math.max(this.currentStrain, this.currentSectionPeak);
    }

    /**
     * Saves the current peak strain level to the list of strain peaks, which will be used to calculate an overall difficulty.
     */
    private saveCurrentPeak(): void {
        this.strainPeaks.push(this.currentSectionPeak);
    }

    /**
     * Sets the initial strain level for a new section.
     * 
     * @param offset The beginning of the new section in milliseconds, adjusted by speed multiplier.
     */
    private startNewSectionFrom(offset: number): void {
        // The maximum strain of the new section is not zero by default.
        // This means we need to capture the strain level at the beginning of the new section, and use that as the initial peak level.
        this.currentSectionPeak = this.currentStrain * this.strainDecay(offset - this.previous[0].startTime);
    }

    difficultyValue(): number {
        // Math here preserves the property that two notes of equal difficulty x, we have their summed difficulty = x * starsPerDouble.
        // This also applies to two sets of notes with equal difficulty.
        return Math.pow(
            this.strainPeaks.reduce((a, v) => a + Math.pow(v, 1 / Math.log2(this.starsPerDouble)), 0),
            Math.log2(this.starsPerDouble)
        );
    }

    /**
     * Calculates the strain value of a hitobject.
     */
    protected abstract strainValueAt(current: DifficultyHitObject): number;

    /**
     * Saves the current strain to a hitobject.
     */
    protected abstract saveToHitObject(current: DifficultyHitObject): void;

    /**
     * Calculates strain decay for a specified time frame.
     * 
     * @param ms The time frame to calculate.
     */
    protected strainDecay(ms: number): number {
        return Math.pow(this.strainDecayBase, ms / 1000);
    }
}