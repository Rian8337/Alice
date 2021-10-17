import { OsuSkill } from './OsuSkill';
import { DifficultyHitObject } from '../preprocessing/DifficultyHitObject';
import { Spinner } from '../../beatmap/hitobjects/Spinner';

/**
 * Represents the skill required to correctly aim at every object in the map with a uniform CircleSize and normalized distances.
 */
export class OsuAim extends OsuSkill {
    /**
     * Minimum timing threshold.
     */
    private readonly timingThreshold: number = 107;
    
    private readonly angleBonusBegin: number = Math.PI / 3;
    protected override readonly skillMultiplier: number = 26.25;
    protected override readonly strainDecayBase: number = 0.15;
    protected override readonly reducedSectionCount: number = 10;
    protected override readonly reducedSectionBaseline: number = 0.75;
    protected override readonly difficultyMultiplier: number = 1.06;
    protected override readonly decayWeight: number = 0.9;

    /**
     * @param current The hitobject to calculate.
     */
    protected strainValueOf(current: DifficultyHitObject): number {
        if (current.object instanceof Spinner) {
            return 0;
        }

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