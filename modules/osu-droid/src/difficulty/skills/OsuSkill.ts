import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { Interpolation } from "../../mathutil/Interpolation";
import { MathUtils } from "../../mathutil/MathUtils";
import { StrainSkill } from "../base/StrainSkill";

/**
 * Used to processes strain values of difficulty hitobjects, keep track of strain levels caused by the processed objects
 * and to calculate a final difficulty value representing the difficulty of hitting all the processed objects.
 */
export abstract class OsuSkill extends StrainSkill {
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
     * The final multiplier to be applied to the final difficulty value after all other calculations.
     */
    protected abstract readonly difficultyMultiplier: number;

    /**
     * The weight by which each strain value decays.
     */
    protected abstract readonly decayWeight: number;

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

    difficultyValue(): number {
        let difficulty: number = 0;
        let weight: number = 1;

        const sortedStrains: number[] = this.strainPeaks.slice().sort((a, b) => {
            return b - a;
        });

        // We are reducing the highest strains first to account for extreme difficulty spikes.
        for (let i = 0; i < Math.min(sortedStrains.length, this.reducedSectionCount); ++i) {
            const scale: number = Math.log10(Interpolation.lerp(1, 10, MathUtils.clamp(i / this.reducedSectionCount, 0, 1)));

            sortedStrains[i] *= Interpolation.lerp(this.reducedSectionBaseline, 1, scale);
        }

        // Difficulty is the weighted sum of the highest strains from every section.
        // We're sorting from highest to lowest strain.
        sortedStrains.sort((a, b) => {
            return b - a;
        }).forEach(strain => {
            difficulty += strain * weight;
            weight *= this.decayWeight;
        });

        return difficulty * this.difficultyMultiplier;
    }
}