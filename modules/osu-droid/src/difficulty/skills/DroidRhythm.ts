import { Slider } from "../../beatmap/hitobjects/Slider";
import { Spinner } from "../../beatmap/hitobjects/Spinner";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to correctly process rhythm.
 */
export class DroidRhythm extends DroidSkill {
    protected readonly skillMultiplier: number = 1.5;
    protected readonly reducedSectionCount: number = 10;
    protected readonly reducedSectionBaseline: number = 0.75;
    protected readonly starsPerDouble: number = 1.025;
    protected readonly historyLength: number = 16;
    protected readonly strainDecayBase: number = 0.15;

    private readonly historyTimeMax: number = 3000; // 3 seconds of calculateRhythmBonus max.

    strainValueAt(current: DifficultyHitObject): number {
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

        this.currentStrain *= this.strainDecay(current.deltaTime);
        this.currentStrain += Math.sqrt(4 + rhythmComplexitySum) / 2 * this.skillMultiplier;

        return this.currentStrain;
    }

    protected saveToHitObject(current: DifficultyHitObject): void {
        current.rhythmStrain = this.currentStrain;
    }

    private isRatioEqual(ratio: number, a: number, b: number): boolean {
        return a + 15 > ratio * b && a - 15 < ratio * b;
    }
}