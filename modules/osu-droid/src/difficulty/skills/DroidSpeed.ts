import { Spinner } from "../../beatmap/hitobjects/Spinner";
import { Interpolation } from "../../mathutil/Interpolation";
import { MathUtils } from "../../mathutil/MathUtils";
import { Mod } from "../../mods/Mod";
import { OsuHitWindow } from "../../utils/HitWindow";
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

    protected override readonly historyLength: number = 2;
    protected override readonly skillMultiplier: number = 1375;
    protected override readonly strainDecayBase: number = 0.3;
    protected override readonly starsPerDouble: number = 1.1;

    // ~200 1/4 BPM streams
    private readonly minSpeedBonus: number = 75;

    private currentTapStrain: number = 0;
    private currentMovementStrain: number = 0;
    private currentOriginalTapStrain: number = 0;

    private readonly overallDifficulty: number;

    constructor(mods: Mod[], overallDifficulty: number) {
        super(mods);

        this.overallDifficulty = overallDifficulty;
    }

    /**
     * @param current The hitobject to calculate.
     */
    protected strainValueOf(current: DifficultyHitObject): number {
        if (current.object instanceof Spinner) {
            return 0;
        }

        let strainTime: number = current.strainTime;

        const greatWindowFull: number = new OsuHitWindow(this.overallDifficulty).hitWindowFor300() * 2;

        // Aim to nerf cheesy rhythms (very fast consecutive doubles with large deltatimes between).
        if (this.previous[0] && strainTime < greatWindowFull && this.previous[0].strainTime > strainTime) {
            strainTime = Interpolation.lerp(this.previous[0].strainTime, strainTime, strainTime / greatWindowFull);
        }

        // Cap deltatime to the OD 300 hitwindow.
        // This equation is derived from making sure 260 BPM 1/4 OD7 streams aren't nerfed harshly.
        strainTime /= MathUtils.clamp(strainTime / new OsuHitWindow(this.overallDifficulty - 122).hitWindowFor300() / 0.075, 0.92, 1);

        let speedBonus: number = 1;

        if (strainTime < this.minSpeedBonus) {
            speedBonus += 0.75 * Math.pow((this.minSpeedBonus - strainTime) / 40, 2);
        }

        let originalSpeedBonus: number = 1;

        if (current.strainTime < this.minSpeedBonus) {
            originalSpeedBonus += 0.75 * Math.pow((this.minSpeedBonus - current.strainTime) / 40, 2);
        }

        const decay: number = this.strainDecay(current.deltaTime);

        this.currentTapStrain *= decay;
        this.currentTapStrain += this.tapStrainOf(speedBonus, strainTime) * this.skillMultiplier;

        this.currentOriginalTapStrain *= decay;
        this.currentOriginalTapStrain += this.tapStrainOf(originalSpeedBonus, current.strainTime) * this.skillMultiplier;

        this.currentMovementStrain *= decay;
        this.currentMovementStrain += this.movementStrainOf(current, speedBonus, strainTime) * this.skillMultiplier;

        return this.currentMovementStrain + this.currentTapStrain;
    }

    /**
     * @param current The hitobject to calculate.
     */
    protected override strainValueAt(current: DifficultyHitObject): number {
        this.currentStrain = this.strainValueOf(current);

        return this.currentStrain;
    }

    /**
     * @param current The hitobject to save to.
     */
    override saveToHitObject(current: DifficultyHitObject): void {
        current.movementStrain = this.currentMovementStrain;
        current.tapStrain = this.currentTapStrain;
        current.originalTapStrain = this.currentOriginalTapStrain;
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