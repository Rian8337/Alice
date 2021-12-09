import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { Skill } from "./Skill";

/**
 * Used to processes strain values of difficulty hitobjects, keep track of strain levels caused by the processed objects
 * and to calculate a final difficulty value representing the difficulty of hitting all the processed objects.
 */
export abstract class StrainSkill extends Skill {
    /**
     * The strain of currently calculated hitobject.
     */
    protected currentStrain: number = 0;

    /**
     * The current section's strain peak.
     */
    protected currentSectionPeak: number = 0;

    /**
     * Strain peaks are stored here.
     */
    readonly strainPeaks: number[] = [];

    /**
     * The number of sections with the highest strains, which the peak strain reductions will apply to.
     * This is done in order to decrease their impact on the overall difficulty of the map for this skill.
     */
    protected abstract readonly reducedSectionCount: number;

    /**
     * The baseline multiplier applied to the section with the biggest strain.
     */
    protected abstract readonly reducedSectionBaseline: number;

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

    protected readonly sectionLength: number = 400;

    protected currentSectionEnd: number = 0;

    /**
     * Calculates the strain value of a hitobject and stores the value in it. This value is affected by previously processed objects.
     *
     * @param current The hitobject to process.
     */
    protected override process(current: DifficultyHitObject): void {
        // The first object doesn't generate a strain, so we begin with an incremented section end
        if (this.previous.length === 0) {
            this.currentSectionEnd =
                Math.ceil(current.startTime / this.sectionLength) *
                this.sectionLength;
        }

        while (current.startTime > this.currentSectionEnd) {
            this.saveCurrentPeak();
            this.startNewSectionFrom(this.currentSectionEnd);
            this.currentSectionEnd += this.sectionLength;
        }

        this.currentStrain = this.strainValueAt(current);

        this.saveToHitObject(current);

        this.currentSectionPeak = Math.max(
            this.currentStrain,
            this.currentSectionPeak
        );
    }

    /**
     * Saves the current peak strain level to the list of strain peaks, which will be used to calculate an overall difficulty.
     */
    saveCurrentPeak(): void {
        this.strainPeaks.push(this.currentSectionPeak);
    }

    /**
     * Sets the initial strain level for a new section.
     *
     * @param offset The beginning of the new section in milliseconds, adjusted by speed multiplier.
     */
    protected startNewSectionFrom(offset: number): void {
        // The maximum strain of the new section is not zero by default, strain decays as usual regardless of section boundaries.
        // This means we need to capture the strain level at the beginning of the new section, and use that as the initial peak level.
        this.currentSectionPeak =
            this.currentStrain *
            this.strainDecay(offset - this.previous[0].startTime);
    }

    /**
     * Calculates strain decay for a specified time frame.
     *
     * @param ms The time frame to calculate.
     */
    protected strainDecay(ms: number): number {
        return Math.pow(this.strainDecayBase, ms / 1000);
    }

    /**
     * Calculates the strain value at a hitobject.
     */
    protected abstract strainValueAt(current: DifficultyHitObject): number;

    /**
     * Saves the current strain to a hitobject.
     */
    protected abstract saveToHitObject(current: DifficultyHitObject): void;
}
