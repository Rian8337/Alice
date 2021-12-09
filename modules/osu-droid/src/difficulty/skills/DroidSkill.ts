import { StrainSkill } from "../base/StrainSkill";

/**
 * Used to processes strain values of difficulty hitobjects, keep track of strain levels caused by the processed objects
 * and to calculate a final difficulty value representing the difficulty of hitting all the processed objects.
 */
export abstract class DroidSkill extends StrainSkill {
    /**
     * The bonus multiplier that is given for a sequence of notes of equal difficulty.
     */
    protected abstract readonly starsPerDouble: number;

    override difficultyValue(): number {
        // Math here preserves the property that two notes of equal difficulty x, we have their summed difficulty = x * starsPerDouble.
        // This also applies to two sets of notes with equal difficulty.
        return Math.pow(
            this.strainPeaks.reduce(
                (a, v) => a + Math.pow(v, 1 / Math.log2(this.starsPerDouble)),
                0
            ),
            Math.log2(this.starsPerDouble)
        );
    }
}
