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

    private readonly historyTimeMax: number = 5000; // 5 seconds of calculateRhythmBonus max.

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

        // Store the ratio of the current start of an island to buff for tighter rhythms.
        let startRatio: number = 0;

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
            const lastDelta: number = this.previous[i + 1].strainTime;

            const currentRatio: number = 1 + 6 * Math.min(
                0.5,
                Math.pow(
                    Math.sin(
                        Math.PI / (Math.min(prevDelta, currentDelta) / Math.max(prevDelta, currentDelta))
                    ),
                    2
                )
            );

            const windowPenalty: number = Math.min(
                1,
                Math.max(
                    0,
                    Math.abs(prevDelta - currentDelta) - this.greatWindow * 0.6
                ) / (this.greatWindow * 0.6)
            );

            let effectiveRatio: number = windowPenalty * currentRatio;

            if (firstDeltaSwitch) {
                if (prevDelta <= 1.25 * currentDelta && prevDelta * 1.25 >= currentDelta) {
                    // Island is still progressing, count size.
                    if (islandSize < 7) {
                        ++islandSize;
                    }
                } else {
                    if (this.previous[i - 1].object instanceof Slider) {
                        // BPM change is into slider, this is easy acc window.
                        effectiveRatio /= 8;
                    }

                    if (this.previous[i].object instanceof Slider) {
                        // BPM change was from a slider, this is typically easier than circle -> circle.
                        effectiveRatio /= 4;
                    }

                    if (previousIslandSize === islandSize) {
                        // Repeated island size (ex: triplet -> triplet).
                        effectiveRatio /= 4;
                    }

                    if (previousIslandSize % 2 === islandSize % 2) {
                        // Repeated island polarity (2 -> 4, 3 -> 5).
                        effectiveRatio /= 2;
                    }

                    if (lastDelta > prevDelta + 10 && prevDelta > currentDelta + 10) {
                        // Previous increase happened a note ago.
                        // Albeit this is a 1/1 -> 1/2-1/4 type of transition, we don't want to buff this.
                        effectiveRatio /= 8;
                    }

                    rhythmComplexitySum += Math.sqrt(effectiveRatio * startRatio) * currentHistoricalDecay * Math.sqrt(4 + islandSize) / 2 * Math.sqrt(4 + previousIslandSize) / 2;

                    startRatio = effectiveRatio;

                    previousIslandSize = islandSize;

                    if (prevDelta * 1.25 < currentDelta) {
                        // We're slowing down, stop counting.
                        // If we're speeding up, this stays as is and we keep counting island size.
                        firstDeltaSwitch = false;
                    }

                    islandSize = 1;
                }
            } else if (prevDelta > 1.25 * currentDelta) {
                // We want to be speeding up.
                // Begin counting island until we change speed again.
                firstDeltaSwitch = true;
                startRatio = effectiveRatio;
                islandSize = 1;
            }
        }

        this.currentStrain *= this.strainDecay(current.deltaTime);
        this.currentStrain += Math.sqrt(4 + rhythmComplexitySum) / 2 * this.skillMultiplier;

        return this.currentStrain;
    }

    protected saveToHitObject(current: DifficultyHitObject): void {
        current.rhythmStrain = this.currentStrain;
    }
}