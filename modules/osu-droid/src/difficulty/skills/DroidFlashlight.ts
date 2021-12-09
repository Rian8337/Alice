import { Spinner } from "../../beatmap/hitobjects/Spinner";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to memorize and hit every object in a beatmap with the Flashlight mod enabled.
 */
export class DroidFlashlight extends DroidSkill {
    protected override readonly historyLength: number = 10;
    protected override readonly skillMultiplier: number = 0.15;
    protected override readonly strainDecayBase: number = 0.15;
    protected override readonly reducedSectionCount: number = 10;
    protected override readonly reducedSectionBaseline: number = 0.75;
    protected override readonly starsPerDouble: number = 1.1;

    protected strainValueOf(current: DifficultyHitObject): number {
        if (current.object instanceof Spinner) {
            return 0;
        }

        const scalingFactor: number = 52 / current.object.radius;

        let smallDistNerf: number = 1;

        let cumulativeStrainTime: number = 0;

        let result: number = 0;

        for (let i = 0; i < this.previous.length; ++i) {
            const previous: DifficultyHitObject = this.previous[i];

            if (previous.object instanceof Spinner) {
                continue;
            }

            const jumpDistance: number =
                current.object.stackedPosition.subtract(
                    previous.object.endPosition
                ).length;

            cumulativeStrainTime += previous.strainTime;

            // We want to nerf objects that can be easily seen within the Flashlight circle radius.
            if (i === 0) {
                smallDistNerf = Math.min(1, jumpDistance / 75);
            }

            // We also want to nerf stacks so that only the first object of the stack is accounted for.
            const stackNerf: number = Math.min(
                1,
                previous.jumpDistance / scalingFactor / 25
            );

            result +=
                (Math.pow(0.8, i) * stackNerf * scalingFactor * jumpDistance) /
                cumulativeStrainTime;
        }

        return Math.pow(smallDistNerf * result, 2) * this.skillMultiplier;
    }

    /**
     * @param current The hitobject to calculate.
     */
    protected override strainValueAt(current: DifficultyHitObject): number {
        this.currentStrain *= this.strainDecay(current.deltaTime);
        this.currentStrain +=
            this.strainValueOf(current) * this.skillMultiplier;

        return this.currentStrain;
    }

    protected override saveToHitObject(current: DifficultyHitObject): void {
        current.flashlightStrain = this.currentStrain;
    }
}
