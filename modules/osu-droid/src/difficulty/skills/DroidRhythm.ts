import { Slider } from "../../beatmap/hitobjects/Slider";
import { Spinner } from "../../beatmap/hitobjects/Spinner";
import { Mod } from "../../mods/Mod";
import { Precision } from "../../utils/Precision";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to correctly process rhythm.
 */
export class DroidRhythm extends DroidSkill {
    protected readonly skillMultiplier: number = 1.5;
    protected readonly starsPerDouble: number = 1.01;
    protected readonly historyLength: number = 32;
    protected readonly strainDecayBase: number = 0.3;

    private readonly historyTimeMax: number = 5000; // 3 seconds of calculateRhythmBonus max.

    private readonly greatWindow: number;

    constructor(mods: Mod[], greatWindow: number) {
        super(mods);

        this.greatWindow = greatWindow;
    }

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
                        // BPM change was from a slider, this is typically easier than circle -> circle.
                        effectiveRatio /= 2;
                    }

                    if (previousIslandSize === islandSize) {
                        // Repeated island size (ex: triplet -> triplet).
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

        this.currentStrain *= this.strainDecay(current.deltaTime);
        this.currentStrain += Math.sqrt(4 + rhythmComplexitySum * Math.sqrt(52 / (this.greatWindow * 2))) / 2 * this.skillMultiplier;

        return this.currentStrain;
    }

    protected saveToHitObject(current: DifficultyHitObject): void {
        current.rhythmStrain = this.currentStrain;
    }
}