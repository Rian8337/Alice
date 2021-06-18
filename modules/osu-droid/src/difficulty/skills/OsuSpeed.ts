import { OsuSkill } from './OsuSkill';
import { DifficultyHitObject } from '../preprocessing/DifficultyHitObject';
import { Spinner } from '../../beatmap/hitobjects/Spinner';

/**
 * Represents the skill required to press keys or tap with regards to keeping up with the speed at which objects need to be hit.
 */
export class OsuSpeed extends OsuSkill {
    /**
     * Spacing threshold for a single hitobject spacing.
     */
    private readonly SINGLE_SPACING_THRESHOLD: number = 125;

    private readonly angleBonusBegin: number = 5 * Math.PI / 6;
    protected readonly skillMultiplier: number = 1400;
    protected readonly strainDecayBase: number = 0.3;

    // ~200 1/4 BPM streams
    private readonly minSpeedBonus: number = 75;

    // ~330 BPM 1/4 streams
    private readonly maxSpeedBonus: number = 45;

    private readonly angleBonusScale: number = 90;

    /**
     * @param currentObject The hitobject to calculate.
     */
    strainValueOf(currentObject: DifficultyHitObject): number {
        if (!currentObject.strainTime || currentObject.object instanceof Spinner) {
            return 0;
        }

        const distance: number = Math.min(this.SINGLE_SPACING_THRESHOLD, currentObject.jumpDistance + currentObject.travelDistance);
        const deltaTime: number = Math.max(this.maxSpeedBonus, currentObject.deltaTime);

        let speedBonus: number = 1;
        if (deltaTime < this.minSpeedBonus) {
            speedBonus += Math.pow((this.minSpeedBonus - deltaTime) / 40, 2);
        }

        let angleBonus: number = 1;
        if (currentObject.angle !== null && currentObject.angle < this.angleBonusBegin) {
            angleBonus += Math.pow(
                Math.sin(1.5 * (this.angleBonusBegin - currentObject.angle)),
                2
            ) / 3.57;
            if (currentObject.angle < Math.PI / 2) {
                angleBonus = 1.28;
                if (distance < this.angleBonusScale && currentObject.angle < Math.PI / 4) {
                    angleBonus += (1 - angleBonus) *
                        Math.min((this.angleBonusScale - distance) / 10, 1);
                } else if (distance < this.angleBonusScale) {
                    angleBonus += (1 - angleBonus) *
                        Math.min((this.angleBonusScale - distance) / 10, 1) *
                        Math.sin((Math.PI / 2 - currentObject.angle) * 4 / Math.PI);
                }
            }
        }

        return (1 + (speedBonus - 1) * 0.75) * angleBonus *
            (0.95 + speedBonus * Math.pow(distance / this.SINGLE_SPACING_THRESHOLD, 3.5))
            / currentObject.strainTime;
    }

    /**
     * @param currentObject The hitobject to save to.
     */
    saveToHitObject(currentObject: DifficultyHitObject): void {
        currentObject.speedStrain = this.currentStrain;
    }
}