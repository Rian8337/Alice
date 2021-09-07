import { Spinner } from "../../beatmap/hitobjects/Spinner";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to press keys or tap with regards to keeping up with the speed at which objects need to be hit.
 */
export class DroidTap extends DroidSkill {
    protected readonly starsPerDouble: number = 1.075;
    protected readonly historyLength: number = 16;
    protected readonly decayExcessThreshold: number = 500;
    protected readonly baseDecay: number = 0.9;

    private readonly strainTimeBuffRange: number = 75;

    // Global Tap Strain Multiplier.
    private readonly singleMultiplier: number = 2.375;
    private readonly strainMultiplier: number = 2.725;

    protected strainValueOf(current: DifficultyHitObject): number {
        if (current.object instanceof Spinner || this.previous.length === 0) {
            return 0;
        }

        const avgDeltaTime: number = (current.strainTime + this.previous[0].strainTime) / 2;

        // Scale tap value for high BPM (above 200).
        const r: number = this.strainTimeBuffRange / avgDeltaTime;

        const strainValue: number = 0.25 + Math.pow(r, r > 1 ? 2 : 1);

        this.currentStrain *= this.computeDecay(current.strainTime);
        this.currentStrain += (0.5 + current.snapProbability) * strainValue * this.singleMultiplier;

        const strain: number = Math.max(
            // Prevent over buffing strain past death stream level.
            strainValue * this.strainMultiplier / (1 - this.baseDecay),
            // Use a separate strain for singles to not complete nuke boring 1-2 maps.
            this.currentStrain
        ); 

        return strain;
    }

    protected saveToHitObject(current: DifficultyHitObject): void {
        current.tapStrain = this.strains.at(-1)!;
    }
}