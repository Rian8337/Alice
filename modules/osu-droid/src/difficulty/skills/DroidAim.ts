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

    /**
     * Spacing threshold for a single hitobject spacing.
     */
    private readonly SINGLE_SPACING_THRESHOLD: number = 175;

    // ~200 1/2 BPM jumps
    private readonly minSpeedBonus: number = 150;
    private readonly angleBonusBegin: number = Math.PI / 3;

    protected override readonly skillMultiplier: number = 26.25;
    protected override readonly strainDecayBase: number = 0.15;
    protected override readonly reducedSectionCount: number = 10;
    protected override readonly reducedSectionBaseline: number = 0.75;
    protected override readonly starsPerDouble: number = 1.05;

    /**
     * @param current The hitobject to calculate.
     */
    protected strainValueOf(current: DifficultyHitObject): number {
        if (current.object instanceof Spinner) {
            return 0;
        }

        return this.aimStrainOf(current) + this.movementStrainOf(current);
    }

    /**
     * Calculates the aim strain of a hitobject.
     */
    private aimStrainOf(current: DifficultyHitObject): number {
        let result: number = 0;
        const scale: number = 90;

        function applyDiminishingExp(val: number): number {
            return Math.pow(val, 0.99);
        };

        if (this.previous.length > 0 && current.angle !== null && current.angle > this.angleBonusBegin) {
            const angleBonus: number = Math.sqrt(
                Math.max(this.previous[0].jumpDistance - scale, 0) *
                Math.pow(Math.sin(current.angle - this.angleBonusBegin), 2) *
                Math.max(current.jumpDistance - scale, 0)
            );
            result = 1.4 * applyDiminishingExp(Math.max(0, angleBonus)) /
                Math.max(this.timingThreshold, this.previous[0].strainTime);
        }

        const jumpDistanceExp: number = applyDiminishingExp(current.jumpDistance);
        const travelDistanceExp: number = applyDiminishingExp(current.travelDistance);
        const weightedDistance: number = jumpDistanceExp + travelDistanceExp + Math.sqrt(travelDistanceExp * jumpDistanceExp);

        return Math.max(
            result + weightedDistance / Math.max(current.strainTime, this.timingThreshold),
            weightedDistance / current.strainTime
        );
    }

    /**
     * Calculates the movement strain of a hitobject.
     */
    private movementStrainOf(current: DifficultyHitObject): number {
        let speedBonus: number = 1;

        if (current.strainTime < this.minSpeedBonus) {
            speedBonus += 0.75 * Math.pow((this.minSpeedBonus - current.strainTime) / 45, 2);
        }

        const distance: number = Math.min(this.SINGLE_SPACING_THRESHOLD, current.jumpDistance + current.travelDistance);

        return 50 * speedBonus * Math.pow(distance / this.SINGLE_SPACING_THRESHOLD, 5) / current.strainTime;
    }

    /**
     * @param current The hitobject to calculate.
     */
    protected override strainValueAt(current: DifficultyHitObject): number {
        this.currentStrain *= this.strainDecay(current.deltaTime);
        this.currentStrain += this.strainValueOf(current) * this.skillMultiplier;

        return this.currentStrain;
    }

    /**
     * @param current The hitobject to save to.
     */
    override saveToHitObject(current: DifficultyHitObject): void {
        current.aimStrain = this.currentStrain;
    }
}