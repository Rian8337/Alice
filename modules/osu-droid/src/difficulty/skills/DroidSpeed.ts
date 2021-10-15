import { Spinner } from "../../beatmap/hitobjects/Spinner";
import { Interpolation } from "../../mathutil/Interpolation";
import { MathUtils } from "../../mathutil/MathUtils";
import { Mod } from "../../mods/Mod";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to press keys or tap with regards to keeping up with the speed at which objects need to be hit.
 */
export class DroidSpeed extends DroidSkill {
    /**
     * Spacing threshold for a single hitobject spacing.
     */
    private readonly SINGLE_SPACING_THRESHOLD: number = 125;

    protected readonly historyLength: number = 32;
    protected readonly skillMultiplier: number = 1375;
    protected readonly strainDecayBase: number = 0.3;
    protected readonly starsPerDouble: number = 1.1;

    // ~200 1/4 BPM streams
    private readonly minSpeedBonus: number = 75;

    private currentTapStrain: number = 1;
    private currentMovementStrain: number = 1;

    private readonly greatWindow: number;

    constructor(mods: Mod[], greatWindow: number) {
        super(mods);

        this.greatWindow = greatWindow;
    }

    /**
     * @param current The hitobject to calculate.
     */
    protected strainValueOf(current: DifficultyHitObject): number {
        if (current.object instanceof Spinner) {
            return 0;
        }

        let strainTime: number = current.strainTime;

        const greatWindowFull: number = this.greatWindow * 2;
        const speedWindowRatio: number = strainTime / greatWindowFull;

        // Aim to nerf cheesy rhythms (very fast consecutive doubles with large deltatimes between).
        if (this.previous[0] && strainTime < greatWindowFull && this.previous[0].strainTime > strainTime) {
            strainTime = Interpolation.lerp(this.previous[0].strainTime, strainTime, speedWindowRatio);
        }

        // Cap deltatime to the OD 300 hitwindow.
        // 0.485 is derived from making sure 260 BPM 1/4 OD8 (droid) streams aren't nerfed harshly, whilst 0.92 limits the effect of the cap.
        strainTime /= MathUtils.clamp(speedWindowRatio / 0.485, 0.92, 1);

        let speedBonus: number = 1;

        if (strainTime < this.minSpeedBonus) {
            speedBonus += 0.75 * Math.pow((this.minSpeedBonus - strainTime) / 40, 2);
        }

        const decay: number = this.strainDecay(current.deltaTime);

        this.currentTapStrain *= decay;
        this.currentTapStrain += this.tapStrainOf(speedBonus, strainTime);

        this.currentMovementStrain *= decay;
        this.currentMovementStrain += this.movementStrainOf(current, speedBonus, strainTime);

        return this.currentMovementStrain + this.currentTapStrain;
    }

    /**
     * @param current The hitobject to calculate.
     */
    protected strainValueAt(current: DifficultyHitObject): number {
        this.currentStrain = this.strainValueOf(current) * this.skillMultiplier;

        return this.currentStrain;
    }

    /**
     * @param current The hitobject to save to.
     */
    saveToHitObject(current: DifficultyHitObject): void {
        current.movementStrain = this.currentMovementStrain;
        current.tapStrain = this.currentTapStrain;
    }

    /**
     * Calculates the tap strain of a hitobject.
     */
    private tapStrainOf(speedBonus: number, strainTime: number): number {
        return speedBonus / strainTime;
    }

    /**
     * Calculates the movement strain of a hitobject.
     */
    private movementStrainOf(current: DifficultyHitObject, speedBonus: number, strainTime: number): number {
        const distance: number = Math.min(this.SINGLE_SPACING_THRESHOLD, current.jumpDistance + current.travelDistance);

        return speedBonus * Math.pow(distance / this.SINGLE_SPACING_THRESHOLD, 3.5) / strainTime;
    }
}