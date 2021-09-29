import { Slider } from "../../beatmap/hitobjects/Slider";
import { Spinner } from "../../beatmap/hitobjects/Spinner";
import { Interpolation } from "../../mathutil/Interpolation";
import { MathUtils } from "../../mathutil/MathUtils";
import { Mod } from "../../mods/Mod";
import { Precision } from "../../utils/Precision";
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

    private readonly angleBonusBegin: number = 5 * Math.PI / 6;
    protected readonly historyLength: number = 32;
    protected readonly skillMultiplier: number = 1375;
    protected readonly strainDecayBase: number = 0.3;
    protected readonly starsPerDouble: number = 1.1;

    // ~200 1/4 BPM streams
    private readonly minSpeedBonus: number = 75;

    private readonly rhythmMultiplier: number = 2;
    private readonly historyTimeMax: number = 5000; // 5 seconds of calculateRhythmBonus max.

    private currentTapStrain: number = 1;
    private currentMovementStrain: number = 1;
    private currentRhythm: number = 1;

    private readonly greatWindow: number;

    constructor(mods: Mod[], greatWindow: number) {
        super(mods);

        this.greatWindow = greatWindow;
    }

    /**
     * @param current The hitobject to calculate.
     */
    strainValueAt(current: DifficultyHitObject): number {
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

        this.currentRhythm = this.calculateRhythmBonus(current);

        const decay: number = this.strainDecay(current.deltaTime);

        this.currentTapStrain *= decay;
        this.currentTapStrain += this.tapStrainOf(current, speedBonus, strainTime) * this.skillMultiplier;

        this.currentMovementStrain *= decay;
        this.currentMovementStrain += this.movementStrainOf(current, speedBonus, strainTime) * this.skillMultiplier;

        return this.currentMovementStrain + this.currentTapStrain * this.currentRhythm;
    }

    /**
     * @param current The hitobject to save to.
     */
    saveToHitObject(current: DifficultyHitObject): void {
        current.movementStrain = this.currentMovementStrain;
        current.tapStrain = this.currentTapStrain;
        current.rhythmMultiplier = this.currentRhythm;
    }

    /**
     * Calculates a rhythm multiplier for the difficulty of the tap associated with historic data of the current object.
     */
    private calculateRhythmBonus(current: DifficultyHitObject): number {
        if (current.object instanceof Spinner) {
            return 0;
        }

        let previousIslandSize: number = -1;
        let rhythmComplexitySum: number = 0;
        let islandSize: number = 0;

        let firstDeltaSwitch: boolean = false;

        for (let i = this.previous.length - 2; i > 0; --i) {
            // Scale note 0 to 1 from history to now.
            let currentHistoricalDecay: number = Math.max(
                0,
                this.historyTimeMax - (current.startTime - this.previous[i - 1].startTime)
            ) / this.historyTimeMax;

            if (currentHistoricalDecay === 0) {
                continue;
            }

            // Either we're limited by time or limited by object count.
            currentHistoricalDecay = Math.min(currentHistoricalDecay, (this.previous.length - i) / this.previous.length);

            const currentDelta: number = this.previous[i - 1].strainTime;
            const prevDelta: number = this.previous[i].strainTime;
            const prevPrevDelta: number = this.previous[i + 1].strainTime;

            let effectiveRatio: number = Math.min(prevDelta, currentDelta) / Math.max(prevDelta, currentDelta);

            if (effectiveRatio > 0.5) {
                // Large buff for 1/3 -> 1/4 type transitions.
                effectiveRatio = 0.5 + (effectiveRatio - 0.5) * 5;
            }

            // Scale with time.
            effectiveRatio *= currentHistoricalDecay;

            if (firstDeltaSwitch) {
                if (Precision.almostEqualsNumber(prevDelta, currentDelta, 15)) {
                    // Island is still progressing, count size.
                    ++islandSize;
                } else {
                    islandSize = Math.min(islandSize, 6);

                    if (this.previous[i - 1].object instanceof Slider) {
                        // BPM change is into slider, this is easy acc window.
                        effectiveRatio /= 4;
                    }

                    if (this.previous[i].object instanceof Slider) {
                        // BPM change was from a slider, this is typically easier than circle -> circle
                        effectiveRatio /= 2;
                    }

                    if (previousIslandSize === islandSize) {
                        // Repeated island size (ex: triplet -> triplet)
                        effectiveRatio /= 4;
                    }

                    if (prevPrevDelta > prevDelta + 10 && prevDelta > currentDelta + 10) {
                        // Previous increase happened a note ago.
                        // Albeit this is a 1/1->1/2-1/4 type of transition, we don't want to buff this.
                        effectiveRatio /= 8;
                    }

                    rhythmComplexitySum += effectiveRatio;

                    previousIslandSize = islandSize;

                    if (prevDelta * 1.25 < currentDelta) {
                        // We're slowing down, stop counting.
                        // If we're speeding up, this stays as is and we keep counting island size.
                        firstDeltaSwitch = false;
                    }

                    islandSize = 0;
                }
            } else if (prevDelta > 1.25 * currentDelta) {
                // We want to be speeding up.
                // Begin counting island until we change speed again.
                firstDeltaSwitch = true;
                islandSize = 0;
            }
        }

        return Math.sqrt(4 + rhythmComplexitySum * this.rhythmMultiplier * Math.sqrt(52 / (this.greatWindow * 2))) / 2;
    }

    /**
     * Calculates the tap strain of a hitobject.
     */
    private tapStrainOf(current: DifficultyHitObject, speedBonus: number, strainTime: number): number {
        if (current.object instanceof Spinner) {
            return 0;
        }

        return speedBonus / strainTime;
    }

    /**
     * Calculates the movement strain of a hitobject.
     */
    private movementStrainOf(current: DifficultyHitObject, speedBonus: number, strainTime: number): number {
        if (current.object instanceof Spinner) {
            return 0;
        }

        const distance: number = Math.min(this.SINGLE_SPACING_THRESHOLD, current.jumpDistance + current.travelDistance);

        let angleBonus: number = 1;
        if (current.angle !== null) {
            if (current.angle < Math.PI / 2) {
                angleBonus += 0.25;
            } else if (current.angle < this.angleBonusBegin) {
                angleBonus += Math.pow(
                    Math.sin(1.5 * (this.angleBonusBegin - current.angle)), 2
                ) / 4;
            }
        }

        return angleBonus * speedBonus * Math.pow(distance / this.SINGLE_SPACING_THRESHOLD, 3.5) / strainTime;
    }
}