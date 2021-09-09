import { Spinner } from "../../beatmap/hitobjects/Spinner";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to correctly aim at every object in the map with a uniform CircleSize and normalized distances.
 */
export class DroidAim extends DroidSkill {
    /**
     * Minimum timing threshold.
     */
    private readonly timingThreshold: number = 107;

    private readonly angleBonusBegin: number = Math.PI / 3;
    protected readonly skillMultiplier: number = 26.25;
    protected readonly strainDecayBase: number = 0.15;
    protected readonly starsPerDouble: number = 1.05;

    /**
     * @param currentObject The hitobject to calculate.
     */
    strainValueAt(currentObject: DifficultyHitObject): number {
        if (currentObject.object instanceof Spinner) {
            return 0;
        }

        let result: number = 0;
        const scale: number = 90;

        function applyDiminishingExp(val: number): number {
            return Math.pow(val, 0.99);
        };

        if (this.previous.length > 0 && currentObject.angle !== null && currentObject.angle > this.angleBonusBegin) {
            const angleBonus: number = Math.sqrt(
                Math.max(this.previous[0].jumpDistance - scale, 0) *
                Math.pow(Math.sin(currentObject.angle - this.angleBonusBegin), 2) *
                Math.max(currentObject.jumpDistance - scale, 0)
            );
            result = 1.4 * applyDiminishingExp(Math.max(0, angleBonus)) /
                Math.max(this.timingThreshold, this.previous[0].strainTime);
        }

        const jumpDistanceExp: number = applyDiminishingExp(currentObject.jumpDistance);
        const travelDistanceExp: number = applyDiminishingExp(currentObject.travelDistance);
        const weightedDistance: number = jumpDistanceExp + travelDistanceExp + Math.sqrt(travelDistanceExp * jumpDistanceExp);

        const aimStrain: number = Math.max(
            result + weightedDistance / Math.max(currentObject.strainTime, this.timingThreshold),
            weightedDistance / currentObject.strainTime
        );

        this.currentStrain *= this.strainDecay(currentObject.deltaTime);
        this.currentStrain += aimStrain * this.skillMultiplier;

        return this.currentStrain;
    }

    /**
     * @param currentObject The hitobject to save to.
     */
    saveToHitObject(currentObject: DifficultyHitObject): void {
        currentObject.aimStrain = this.currentStrain;
    }
}