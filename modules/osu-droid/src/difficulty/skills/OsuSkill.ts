import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { Skill } from "../base/Skill";

/**
 * Used to processes strain values of difficulty hitobjects, keep track of strain levels caused by the processed objects
 * and to calculate a final difficulty value representing the difficulty of hitting all the processed objects.
 */
export abstract class OsuSkill extends Skill {
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

    private readonly sectionLength: number = 400;

    private currentSectionEnd: number = 0;

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

        this.currentStrain *= this.strainDecay(current.deltaTime);
        this.currentStrain += this.strainValueOf(current) * this.skillMultiplier;

        this.saveToHitObject(current);

        this.currentSectionPeak = Math.max(this.currentStrain, this.currentSectionPeak);
    }

    /**
     * Saves the current peak strain level to the list of strain peaks, which will be used to calculate an overall difficulty.
     */
    private saveCurrentPeak(): void {
        if (this.previous.length > 0) {
            this.strainPeaks.push(this.currentSectionPeak);
        }
    }

    /**
     * Sets the initial strain level for a new section.
     * 
     * @param offset The beginning of the new section in milliseconds, adjusted by speed multiplier.
     */
    private startNewSectionFrom(offset: number): void {
        // The maximum strain of the new section is not zero by default, strain decays as usual regardless of section boundaries.
        // This means we need to capture the strain level at the beginning of the new section, and use that as the initial peak level.
        if (this.previous.length > 0) {
            this.currentSectionPeak = this.currentStrain * this.strainDecay(offset - this.previous[0].startTime);
        }
    }

    /**
     * Calculates the difficulty value.
     */
    difficultyValue(): number {
        let difficulty: number = 0;
        let weight: number = 1;
        
        // Difficulty is the weighted sum of the highest strains from every section.
        // We're sorting from highest to lowest strain.
        this.strainPeaks.slice().sort((a, b) => {
            return b - a;
        }).forEach(strain => {
            difficulty += strain * weight;
            weight *= 0.9;
        });

        return difficulty;
    }

    /**
     * Calculates the strain value of a hitobject.
     */
    protected abstract strainValueOf(current: DifficultyHitObject): number;

    /**
     * Saves the current strain to a hitobject.
     */
    protected abstract saveToHitObject(current: DifficultyHitObject): void;

    /**
     * Calculates strain decay for a specified time frame.
     * 
     * @param ms The time frame to calculate.
     */
    private strainDecay(ms: number): number {
        return Math.pow(this.strainDecayBase, ms / 1000);
    }
}