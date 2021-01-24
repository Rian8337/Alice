import { Spinner } from "../../beatmap/hitobjects/Spinner";
import { DifficultyHitObject } from "../../beatmap/hitobjects/DifficultyHitObject";
import { modes } from '../../constants/modes';

export interface DifficultyValue {
    readonly difficulty: number;
    readonly total: number;
}

/**
 * Base class for skill aspects.
 */
export abstract class Skill {
    /**
     * The gamemode this calculator is calculating for.
     */
    protected readonly mode: modes;

    /**
     * The previous hitobjects during a section.
     */
    protected readonly previous: DifficultyHitObject[] = [];

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
    private readonly strainPeaks: number[] = [];

    /**
     * Skill multiplier for currently calculated difficulty factor.
     */
    protected abstract readonly skillMultiplier: number;

    /**
     * Strain decay base for currently calculated difficulty factor.
     */
    protected abstract readonly strainDecayBase: number;

    /**
     * Angle threshold to start giving bonus.
     */
    protected abstract readonly angleBonusBegin: number;

    constructor(mode: modes) {
        this.mode = mode;
    }

    /**
     * Saves the current peak strain level to the list of strain peaks, which will be used to calculate an overall difficulty.
     */
    saveCurrentPeak(): void {
        if (this.previous.length > 0) {
            this.strainPeaks.push(this.currentSectionPeak);
        }
    }

    /**
     * Sets the initial strain level for a new section.
     * 
     * @param offset The beginning of the new section in milliseconds.
     */
    startNewSectionFrom(offset: number): void {
        // The maximum strain of the new section is not zero by default, strain decays as usual regardless of section boundaries.
        // This means we need to capture the strain level at the beginning of the new section, and use that as the initial peak level.
        if (this.previous.length > 0) {
            this.currentSectionPeak = this.currentStrain * this.strainDecay(offset - this.previous[0].object.startTime);
        }
    }

    /**
     * Calculates the strain value of a hitobject and stores the value in it. This value is affected by previously processed objects.
     * 
     * @param currentObject The hitobject to process.
     */
    process(currentObject: DifficultyHitObject): void {
        this.currentStrain *= this.strainDecay(currentObject.deltaTime);
        this.currentStrain += this.strainValueOf(currentObject) * this.skillMultiplier;
        this.saveToHitObject(currentObject);

        this.currentSectionPeak = Math.max(this.currentStrain, this.currentSectionPeak);
        
        this.previous.unshift(currentObject);
        if (this.previous.length > 2) {
            this.previous.pop();
        }
    }

    /**
     * Calculates the difficulty value.
     */
    difficultyValue(): DifficultyValue {
        // Difficulty is the weighted sum of the highest strains from every section.
        // We're sorting from highest to lowest strain.
        this.strainPeaks.sort((a, b) => {
            return b - a;
        });

        let difficulty: number = 0;
        let total: number = 0;
        let weight: number = 1;

        this.strainPeaks.forEach(strain => {
            total += Math.pow(strain, 1.2);
            difficulty += strain * weight;
            weight *= 0.9;
        });

        return {difficulty: difficulty, total: total};
    }

    /**
     * Calculates the strain value of a hitobject.
     */
    protected abstract strainValueOf(currentObject: DifficultyHitObject): number;

    /**
     * Saves the current strain to a hitobject.
     */
    protected abstract saveToHitObject(currentObject: DifficultyHitObject): void;

    /**
     * Calculates strain decay for a specified time frame.
     * 
     * @param ms The time frame to calculate.
     */
    private strainDecay(ms: number): number {
        return Math.pow(this.strainDecayBase, ms / 1000);
    }
}