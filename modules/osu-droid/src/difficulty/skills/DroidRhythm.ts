import { Slider } from "../../beatmap/hitobjects/Slider";
import { Spinner } from "../../beatmap/hitobjects/Spinner";
import { Utils } from "../../utils/Utils";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to correctly process rhythm.
 */
export class DroidRhythm extends DroidSkill {
    protected readonly historyLength: number = 16;

    protected readonly baseDecay: number = 0.75;

    protected readonly starsPerDouble: number = 1.075;

    protected readonly decayExcessThreshold: number = 500;

    private readonly strainMultiplier: number = 5;

    protected strainValueOf(current: DifficultyHitObject): number {
        if (current.object instanceof Spinner) {
            return 0;
        }

        // [doubles, triplets, quads, quints, 6-tuplets, 7-tuplets, greater]
        const islandSizes: number[] = Utils.initializeArray(7, 0);
        const islandTimes: number[] = Utils.initializeArray(7, 0);
        let islandSize: number = 0;
        let specialTransitionCount: number = 0;

        let firstDeltaSwitch: boolean = false;

        for (let i = 1; i < this.previous.length; ++i) {
            const prevDelta: number = this.previous[i - 1].strainTime;
            const currentDelta: number = this.previous[i].strainTime;

            if (this.isRatioEqual(1.5, prevDelta, currentDelta) || this.isRatioEqual(1.5, currentDelta, prevDelta)) {
                if (this.previous[i - 1].object instanceof Slider || this.previous[i].object instanceof Slider) {
                    specialTransitionCount += 50 / Math.sqrt(prevDelta * currentDelta) * (this.historyLength - i) / this.historyLength;
                } else {
                    specialTransitionCount += 250 / Math.sqrt(prevDelta * currentDelta) * (this.historyLength - i) / this.historyLength;
                }
            }

            if (firstDeltaSwitch) {
                if (this.isRatioEqual(1, prevDelta, currentDelta)) {
                    // Island is still progressing, count size.
                    ++islandSize;
                } else {
                    islandTimes[Math.min(islandSize, islandSizes.length - 1)] += 100 / Math.sqrt(prevDelta * currentDelta) * (this.historyLength - i) / this.historyLength;
                    ++islandSizes[Math.min(islandSize, islandSizes.length - 1)];

                    if (prevDelta > currentDelta * 1.25) {  // We're speeding up.
                        // Reset and count again, we sped up (usually this could only be if we did a 1/2 -> 1/3 -> 1/4) (or 1/1 -> 1/2 -> 1/4).
                        islandSize = 0;
                    } else { // We're not the same or speeding up, must be slowing down.
                        // Stop counting island until next speed up.
                        firstDeltaSwitch = false;
                    }
                }
            } else if (prevDelta > 1.25 * currentDelta) { // We want to be speeding up.
                // Begin counting island until we slow again.
                firstDeltaSwitch = true;
                islandSize = 0;
            }
        }

        // Sum the total amount of rhythm variance, penalizing for repeated island sizes.
        // Also add in our special transitions.
        const rhythmComplexitySum: number = specialTransitionCount + islandTimes.reduce((a, v, i) => a + v / Math.sqrt(Math.max(1, islandSizes[i])), 0);

        this.currentStrain *= this.computeDecay(current.strainTime);
        this.currentStrain += Math.sqrt(4 + rhythmComplexitySum) / 2 - 1;

        return this.currentStrain * this.strainMultiplier;
    }
    protected saveToHitObject(current: DifficultyHitObject): void {
        current.rhythmStrain = this.strains[this.strains.length - 1];
    }

    private isRatioEqual(ratio: number, a: number, b: number): boolean {
        return a + 15 > ratio * b && a - 15 < ratio * b;
    }
}