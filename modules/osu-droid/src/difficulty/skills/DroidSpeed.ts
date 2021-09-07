import { Slider } from "../../beatmap/hitobjects/Slider";
import { Spinner } from "../../beatmap/hitobjects/Spinner";
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
    protected readonly reducedSectionCount: number = 5;
    protected readonly reducedSectionBaseline: number = 0.75;
    protected readonly difficultyMultiplier: number = 1.04;

    // ~200 1/4 BPM streams
    private readonly minSpeedBonus: number = 75;

    // ~330 BPM 1/4 streams
    private readonly maxSpeedBonus: number = 45;

    private readonly rhythmMultiplier: number = 2.5;
    private readonly historyTimeMax: number = 3000; // 3 seconds of calculateRhythmBonus max.

    private currentRhythm: number = 1;
    private currentTapStrain: number = 1;
    private currentMovementStrain: number = 1;

    /**
     * @param currentObject The hitobject to calculate.
     */
    strainValueAt(currentObject: DifficultyHitObject): number {
        if (currentObject.object instanceof Spinner) {
            return 0;
        }

        let speedBonus: number = 1;
        const deltaTime: number = Math.max(this.maxSpeedBonus, currentObject.deltaTime);

        if (deltaTime < this.minSpeedBonus) {
            speedBonus += 0.75 * Math.pow((this.minSpeedBonus) - deltaTime / 40, 2);
        }

        this.currentRhythm = this.calculateRhythmBonus(currentObject);

        this.currentTapStrain *= this.strainDecay(currentObject.deltaTime);
        this.currentTapStrain += this.tapStrainOf(currentObject, speedBonus) * this.skillMultiplier;

        this.currentMovementStrain *= this.strainDecay(currentObject.deltaTime);
        this.currentMovementStrain += this.movementStrainOf(currentObject, speedBonus);

        return this.currentMovementStrain + this.currentTapStrain * this.currentRhythm;
    }

    /**
     * @param currentObject The hitobject to save to.
     */
    saveToHitObject(currentObject: DifficultyHitObject): void {
        currentObject.speedStrain = this.currentStrain;
    }

    private isRatioEqual(ratio: number, a: number, b: number): boolean {
        return a + 15 > ratio * b && a - 15 < ratio * b;
    }

    /**
     * Calculates a rhythm multiplier for the difficulty of the tap associated with historic data of the current object.
     */
    private calculateRhythmBonus(currentObject: DifficultyHitObject): number {
        if (currentObject.object instanceof Spinner) {
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
                this.historyTimeMax - (currentObject.startTime - this.previous[i - 1].startTime)
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
                effectiveRatio = 0.5 + (effectiveRatio - 0.5) * 10;
            }

            // Scale with BPM slightly and with time.
            effectiveRatio *= Math.sqrt(200 / (currentDelta + prevDelta)) * currentHistoricalDecay;

            if (firstDeltaSwitch) {
                if (this.isRatioEqual(1, prevDelta, currentDelta)) {
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
                        // Albeit this is a 1/1->1/2-1/4 type of transition, we dont want to buff this.
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

        return Math.sqrt(4 + rhythmComplexitySum * this.rhythmMultiplier) / 2;
    }

    /**
     * Calculates the tap strain of a hitobject.
     */
    private tapStrainOf(currentObject: DifficultyHitObject, speedBonus: number): number {
        if (currentObject.object instanceof Spinner) {
            return 0;
        }

        return speedBonus / currentObject.strainTime;
    }

    /**
     * Calculates the movement strain of a hitobject.
     */
    private movementStrainOf(currentObject: DifficultyHitObject, speedBonus: number): number {
        if (currentObject.object instanceof Spinner) {
            return 0;
        }

        const distance: number = Math.min(this.SINGLE_SPACING_THRESHOLD, currentObject.jumpDistance + currentObject.travelDistance);

        let angleBonus: number = 1;
        if (currentObject.angle !== null) {
            if (currentObject.angle < Math.PI / 2) {
                angleBonus += 0.25;
            } else if (currentObject.angle < this.angleBonusBegin) {
                angleBonus += Math.pow(
                    Math.sin(1.5 * (this.angleBonusBegin - currentObject.angle)), 2
                ) / 4;
            }
        }

        return angleBonus * speedBonus * Math.pow(distance / this.SINGLE_SPACING_THRESHOLD, 3.5) / currentObject.strainTime;
    }
}