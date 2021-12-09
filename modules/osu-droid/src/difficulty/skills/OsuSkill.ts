import { Interpolation } from "../../mathutil/Interpolation";
import { MathUtils } from "../../mathutil/MathUtils";
import { StrainSkill } from "../base/StrainSkill";

/**
 * Used to processes strain values of difficulty hitobjects, keep track of strain levels caused by the processed objects
 * and to calculate a final difficulty value representing the difficulty of hitting all the processed objects.
 */
export abstract class OsuSkill extends StrainSkill {
    /**
     * The final multiplier to be applied to the final difficulty value after all other calculations.
     */
    protected abstract readonly difficultyMultiplier: number;

    /**
     * The weight by which each strain value decays.
     */
    protected abstract readonly decayWeight: number;

    override difficultyValue(): number {
        let difficulty: number = 0;
        let weight: number = 1;

        const sortedStrains: number[] = this.strainPeaks
            .slice()
            .sort((a, b) => {
                return b - a;
            });

        // We are reducing the highest strains first to account for extreme difficulty spikes.
        for (
            let i = 0;
            i < Math.min(sortedStrains.length, this.reducedSectionCount);
            ++i
        ) {
            const scale: number = Math.log10(
                Interpolation.lerp(
                    1,
                    10,
                    MathUtils.clamp(i / this.reducedSectionCount, 0, 1)
                )
            );

            sortedStrains[i] *= Interpolation.lerp(
                this.reducedSectionBaseline,
                1,
                scale
            );
        }

        // Difficulty is the weighted sum of the highest strains from every section.
        // We're sorting from highest to lowest strain.
        sortedStrains
            .sort((a, b) => {
                return b - a;
            })
            .forEach((strain) => {
                difficulty += strain * weight;
                weight *= this.decayWeight;
            });

        return difficulty * this.difficultyMultiplier;
    }
}
