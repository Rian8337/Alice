import { OsuSkill } from "./OsuSkill";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { Spinner } from "../../beatmap/hitobjects/Spinner";
import { Mod } from "../../mods/Mod";
import { Interpolation } from "../../mathutil/Interpolation";
import { MathUtils } from "../../mathutil/MathUtils";
import { Slider } from "../../beatmap/hitobjects/Slider";

/**
 * Represents the skill required to press keys or tap with regards to keeping up with the speed at which objects need to be hit.
 */
export class OsuSpeed extends OsuSkill {
    /**
     * Spacing threshold for a single hitobject spacing.
     */
    private readonly SINGLE_SPACING_THRESHOLD: number = 125;

    protected override readonly historyLength: number = 32;
    protected override readonly skillMultiplier: number = 1375;
    protected override readonly strainDecayBase: number = 0.3;
    protected override readonly reducedSectionCount: number = 5;
    protected override readonly reducedSectionBaseline: number = 0.75;
    protected override readonly difficultyMultiplier: number = 1.04;
    protected override readonly decayWeight: number = 0.9;

    private readonly rhythmMultiplier: number = 0.75;
    private readonly historyTimeMax: number = 5000; // 5 seconds of calculateRhythmBonus max.
    private currentSpeedStrain: number = 0;
    private currentRhythm: number = 0;

    // ~200 1/4 BPM streams
    private readonly minSpeedBonus: number = 75;

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
        if (
            this.previous[0] &&
            strainTime < greatWindowFull &&
            this.previous[0].strainTime > strainTime
        ) {
            strainTime = Interpolation.lerp(
                this.previous[0].strainTime,
                strainTime,
                speedWindowRatio
            );
        }

        // Cap deltatime to the OD 300 hitwindow.
        // 0.93 is derived from making sure 260 BPM 1/4 OD8 streams aren't nerfed harshly, whilst 0.92 limits the effect of the cap.
        strainTime /= MathUtils.clamp(
            strainTime / greatWindowFull / 0.93,
            0.92,
            1
        );

        let speedBonus: number = 1;
        if (strainTime < this.minSpeedBonus) {
            speedBonus +=
                0.75 * Math.pow((this.minSpeedBonus - strainTime) / 40, 2);
        }

        const distance: number = Math.min(
            this.SINGLE_SPACING_THRESHOLD,
            current.movementDistance + current.travelDistance
        );

        return (
            (speedBonus +
                speedBonus *
                    Math.pow(distance / this.SINGLE_SPACING_THRESHOLD, 3.5)) /
            strainTime
        );
    }

    /**
     * @param current The hitobject to calculate.
     */
    protected override strainValueAt(current: DifficultyHitObject): number {
        this.currentSpeedStrain *= this.strainDecay(current.deltaTime);
        this.currentSpeedStrain +=
            this.strainValueOf(current) * this.skillMultiplier;

        this.currentRhythm = this.calculateRhythmBonus(current);

        return this.currentSpeedStrain * this.currentRhythm;
    }

    /**
     * Calculates a rhythm multiplier for the difficulty of the tap associated with historic data of the current object.
     */
    private calculateRhythmBonus(current: DifficultyHitObject): number {
        if (current.object instanceof Spinner) {
            return 0;
        }

        let previousIslandSize: number = 0;
        let rhythmComplexitySum: number = 0;
        let islandSize: number = 1;

        // Store the ratio of the current start of an island to buff for tighter rhythms.
        let startRatio: number = 0;

        let firstDeltaSwitch: boolean = false;

        for (let i = this.previous.length - 2; i > 0; --i) {
            // Scale note 0 to 1 from history to now.
            let currentHistoricalDecay: number =
                Math.max(
                    0,
                    this.historyTimeMax -
                        (current.startTime - this.previous[i - 1].startTime)
                ) / this.historyTimeMax;

            if (currentHistoricalDecay === 0) {
                continue;
            }

            // Either we're limited by time or limited by object count.
            currentHistoricalDecay = Math.min(
                currentHistoricalDecay,
                (this.previous.length - i) / this.previous.length
            );

            const currentDelta: number = this.previous[i - 1].strainTime;
            const prevDelta: number = this.previous[i].strainTime;
            const lastDelta: number = this.previous[i + 1].strainTime;

            const currentRatio: number =
                1 +
                6 *
                    Math.min(
                        0.5,
                        Math.pow(
                            Math.sin(
                                Math.PI /
                                    (Math.min(prevDelta, currentDelta) /
                                        Math.max(prevDelta, currentDelta))
                            ),
                            2
                        )
                    );

            const windowPenalty: number = Math.min(
                1,
                Math.max(
                    0,
                    Math.abs(prevDelta - currentDelta) - this.greatWindow * 0.6
                ) /
                    (this.greatWindow * 0.6)
            );

            let effectiveRatio: number = windowPenalty * currentRatio;

            if (firstDeltaSwitch) {
                if (
                    prevDelta <= 1.25 * currentDelta &&
                    prevDelta * 1.25 >= currentDelta
                ) {
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

                    if (
                        lastDelta > prevDelta + 10 &&
                        prevDelta > currentDelta + 10
                    ) {
                        // Previous increase happened a note ago.
                        // Albeit this is a 1/1 -> 1/2-1/4 type of transition, we don't want to buff this.
                        effectiveRatio /= 8;
                    }

                    rhythmComplexitySum +=
                        (((Math.sqrt(effectiveRatio * startRatio) *
                            currentHistoricalDecay *
                            Math.sqrt(4 + islandSize)) /
                            2) *
                            Math.sqrt(4 + previousIslandSize)) /
                        2;

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

        return Math.sqrt(4 + rhythmComplexitySum * this.rhythmMultiplier) / 2;
    }

    /**
     * @param current The hitobject to save to.
     */
    override saveToHitObject(current: DifficultyHitObject): void {
        current.tapStrain = this.currentStrain;
        current.rhythmMultiplier = this.currentRhythm;
    }
}
