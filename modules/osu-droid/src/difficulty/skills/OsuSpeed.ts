import { OsuSkill } from './OsuSkill';
import { DifficultyHitObject } from '../preprocessing/DifficultyHitObject';
import { Spinner } from '../../beatmap/hitobjects/Spinner';
import { Mod } from '../../mods/Mod';
import { Interpolation } from '../../mathutil/Interpolation';
import { MathUtils } from '../../mathutil/MathUtils';

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
    protected readonly reducedSectionCount: number = 5;
    protected readonly reducedSectionBaseline: number = 0.75;
    protected readonly difficultyMultiplier: number = 1.04;
    protected readonly decayWeight: number = 0.9;

    // ~200 1/4 BPM streams
    private readonly minSpeedBonus: number = 75;

    private readonly angleBonusScale: number = 90;

    private readonly greatWindow: number;

    constructor(mods: Mod[], greatWindow: number) {
        super(mods);

        this.greatWindow = greatWindow;
    }

    /**
     * @param current The hitobject to calculate.
     */
    strainValueOf(current: DifficultyHitObject): number {
        if (!current.strainTime || current.object instanceof Spinner) {
            return 0;
        }

        const distance: number = Math.min(this.SINGLE_SPACING_THRESHOLD, current.jumpDistance + current.travelDistance);
        let strainTime: number = current.strainTime;

        const greatWindowFull: number = this.greatWindow * 2;
        const speedWindowRatio: number = strainTime / greatWindowFull;

        // Aim to nerf cheesy rhythms (very fast consecutive doubles with large deltatimes between).
        if (this.previous[0] && strainTime < greatWindowFull && this.previous[0].strainTime > strainTime) {
            strainTime = Interpolation.lerp(this.previous[0].strainTime, strainTime, speedWindowRatio);
        }

        // Cap deltatime to the OD 300 hitwindow.
        // 0.93 is derived from making sure 260bpm OD8 streams aren't nerfed harshly, whilst 0.92 limits the effect of the cap.
        strainTime /= MathUtils.clamp(strainTime / greatWindowFull / 0.93, 0.92, 1);

        let speedBonus: number = 1;
        if (strainTime < this.minSpeedBonus) {
            speedBonus += Math.pow((this.minSpeedBonus - strainTime) / 40, 2);
        }

        let angleBonus: number = 1;
        if (current.angle !== null && current.angle < this.angleBonusBegin) {
            angleBonus += Math.pow(
                Math.sin(1.5 * (this.angleBonusBegin - current.angle)),
                2
            ) / 3.57;
            if (current.angle < Math.PI / 2) {
                angleBonus = 1.28;
                if (distance < this.angleBonusScale && current.angle < Math.PI / 4) {
                    angleBonus += (1 - angleBonus) *
                        Math.min((this.angleBonusScale - distance) / 10, 1);
                } else if (distance < this.angleBonusScale) {
                    angleBonus += (1 - angleBonus) *
                        Math.min((this.angleBonusScale - distance) / 10, 1) *
                        Math.sin((Math.PI / 2 - current.angle) * 4 / Math.PI);
                }
            }
        }

        return (1 + (speedBonus - 1) * 0.75) * angleBonus *
            (0.95 + speedBonus * Math.pow(distance / this.SINGLE_SPACING_THRESHOLD, 3.5))
            / strainTime;
    }

    /**
     * @param current The hitobject to save to.
     */
    saveToHitObject(current: DifficultyHitObject): void {
        // Assign it to movement strain (the value will be equal at the end, see speedStrain getter in `DifficultyHitObject`)
        current.movementStrain = this.currentStrain;
    }
}