import { OsuSkill } from "./OsuSkill";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { Spinner } from "../../beatmap/hitobjects/Spinner";
import { Slider } from "../../beatmap/hitobjects/Slider";
import { MathUtils } from "../../mathutil/MathUtils";
import { Mod } from "../../mods/Mod";

/**
 * Represents the skill required to correctly aim at every object in the map with a uniform CircleSize and normalized distances.
 */
export class OsuAim extends OsuSkill {
    protected override readonly skillMultiplier: number = 23.25;
    protected override readonly strainDecayBase: number = 0.15;
    protected override readonly reducedSectionCount: number = 10;
    protected override readonly reducedSectionBaseline: number = 0.75;
    protected override readonly difficultyMultiplier: number = 1.06;
    protected override readonly decayWeight: number = 0.9;

    private readonly wideAngleMultiplier: number = 1.5;
    private readonly acuteAngleMultiplier: number = 2;
    private readonly sliderMultiplier: number = 1.5;
    private readonly velocityChangeMultiplier: number = 0.75;

    private readonly withSliders: boolean;

    constructor(mods: Mod[], withSliders: boolean) {
        super(mods);

        this.withSliders = withSliders;
    }

    /**
     * @param current The hitobject to calculate.
     */
    protected strainValueOf(current: DifficultyHitObject): number {
        if (
            current.object instanceof Spinner ||
            this.previous.length <= 1 ||
            this.previous[0].object instanceof Spinner
        ) {
            return 0;
        }

        const last: DifficultyHitObject = this.previous[0];
        const lastLast: DifficultyHitObject = this.previous[1];

        // Calculate the velocity to the current hitobject, which starts with a base distance / time assuming the last object is a hitcircle.
        let currentVelocity: number = current.jumpDistance / current.strainTime;

        // But if the last object is a slider, then we extend the travel velocity through the slider into the current object.
        if (last.object instanceof Slider && this.withSliders) {
            // Calculate the movement velocity from slider end to current object.
            const movementVelocity: number =
                current.movementDistance / current.movementTime;

            // Calculate the slider velocity from slider head to slider end.
            const travelVelocity: number =
                current.travelDistance / current.travelTime;

            // Take the larger total combined velocity.
            currentVelocity = Math.max(
                currentVelocity,
                movementVelocity + travelVelocity
            );
        }

        // As above, do the same for the previous hitobject.
        let prevVelocity: number = last.jumpDistance / last.strainTime;

        if (lastLast.object instanceof Slider && this.withSliders) {
            const movementVelocity: number =
                last.movementDistance / last.movementTime;

            const travelVelocity: number =
                last.travelDistance / last.travelTime;

            prevVelocity = Math.max(
                prevVelocity,
                movementVelocity + travelVelocity
            );
        }

        let wideAngleBonus: number = 0;
        let acuteAngleBonus: number = 0;
        let sliderBonus: number = 0;
        let velocityChangeBonus: number = 0;

        // Start strain with regular velocity.
        let strain: number = currentVelocity;

        if (
            Math.max(current.strainTime, last.strainTime) <
            1.25 * Math.min(current.strainTime, last.strainTime)
        ) {
            // If rhythms are the same.

            if (
                current.angle !== null &&
                last.angle !== null &&
                lastLast.angle !== null
            ) {
                // Rewarding angles, take the smaller velocity as base.
                const angleBonus: number = Math.min(
                    currentVelocity,
                    prevVelocity
                );

                wideAngleBonus = this.calculateWideAngleBonus(current.angle);
                acuteAngleBonus = this.calculateAcuteAngleBonus(current.angle);

                // Only buff deltaTime exceeding 300 BPM 1/2.
                if (current.strainTime > 100) {
                    acuteAngleBonus = 0;
                } else {
                    acuteAngleBonus *=
                        // Multiply by previous angle, we don't want to buff unless this is a wiggle type pattern.
                        this.calculateAcuteAngleBonus(last.angle) *
                        // The maximum velocity we buff is equal to 125 / strainTime.
                        Math.min(angleBonus, 125 / current.strainTime) *
                        // Scale buff from 300 BPM 1/2 to 400 BPM 1/2.
                        Math.pow(
                            Math.sin(
                                (Math.PI / 2) *
                                    Math.min(1, (100 - current.strainTime) / 25)
                            ),
                            2
                        ) *
                        // Buff distance exceeding 50 (radius) up to 100 (diameter).
                        Math.pow(
                            Math.sin(
                                ((Math.PI / 2) *
                                    (MathUtils.clamp(
                                        current.jumpDistance,
                                        50,
                                        100
                                    ) -
                                        50)) /
                                    50
                            ),
                            2
                        );
                }

                // Penalize wide angles if they're repeated, reducing the penalty as last.angle gets more acute.
                wideAngleBonus *=
                    angleBonus *
                    (1 -
                        Math.min(
                            wideAngleBonus,
                            Math.pow(
                                this.calculateWideAngleBonus(last.angle),
                                3
                            )
                        ));
                // Penalize acute angles if they're repeated, reducing the penalty as lastLast.angle gets more obtuse.
                acuteAngleBonus *=
                    0.5 +
                    0.5 *
                        (1 -
                            Math.min(
                                acuteAngleBonus,
                                Math.pow(
                                    this.calculateAcuteAngleBonus(
                                        lastLast.angle
                                    ),
                                    3
                                )
                            ));
            }
        }

        if (Math.max(prevVelocity, currentVelocity)) {
            // We want to use the average velocity over the whole object when awarding differences, not the individual jump and slider path velocities.
            prevVelocity =
                (last.jumpDistance + last.travelDistance) / last.strainTime;
            currentVelocity =
                (current.jumpDistance + current.travelDistance) /
                current.strainTime;

            // Scale with ratio of difference compared to half the max distance.
            const distanceRatio: number = Math.pow(
                Math.sin(
                    ((Math.PI / 2) * Math.abs(prevVelocity - currentVelocity)) /
                        Math.max(prevVelocity, currentVelocity)
                ),
                2
            );

            // Reward for % distance up to 125 / strainTime for overlaps where velocity is still changing.
            const overlapVelocityBuff: number = Math.min(
                125 / Math.min(current.strainTime, last.strainTime),
                Math.abs(prevVelocity - currentVelocity)
            );

            // Reward for % distance slowed down compared to previous, paying attention to not award overlap.
            const nonOverlapVelocityBuff: number =
                Math.abs(prevVelocity - currentVelocity) *
                // Do not award overlap.
                Math.pow(
                    Math.sin(
                        (Math.PI / 2) *
                            Math.min(
                                1,
                                Math.min(
                                    current.jumpDistance,
                                    last.jumpDistance
                                ) / 100
                            )
                    ),
                    2
                );

            // Choose the largest bonus, multiplied by ratio.
            velocityChangeBonus =
                Math.max(overlapVelocityBuff, nonOverlapVelocityBuff) *
                distanceRatio;

            // Penalize for rhythm changes.
            velocityChangeBonus *= Math.pow(
                Math.min(current.strainTime, last.strainTime) /
                    Math.max(current.strainTime, last.strainTime),
                2
            );
        }

        if (current.travelTime) {
            // Reward sliders based on velocity.
            sliderBonus = current.travelDistance / current.travelTime;
        }

        // Add in acute angle bonus or wide angle bonus + velocity change bonus, whichever is larger.
        strain += Math.max(
            acuteAngleBonus * this.acuteAngleMultiplier,
            wideAngleBonus * this.wideAngleMultiplier +
                velocityChangeBonus * this.velocityChangeMultiplier
        );

        // Add in additional slider velocity bonus.
        if (this.withSliders) {
            strain += sliderBonus * this.sliderMultiplier;
        }

        return strain;
    }

    /**
     * @param current The hitobject to calculate.
     */
    protected override strainValueAt(current: DifficultyHitObject): number {
        this.currentStrain *= this.strainDecay(current.deltaTime);
        this.currentStrain +=
            this.strainValueOf(current) * this.skillMultiplier;

        return this.currentStrain;
    }

    /**
     * @param current The hitobject to save to.
     */
    override saveToHitObject(current: DifficultyHitObject): void {
        current.aimStrain = this.currentStrain;
    }

    /**
     * Calculates the bonus of wide angles.
     */
    private calculateWideAngleBonus(angle: number): number {
        return Math.pow(
            Math.sin(
                (3 / 4) *
                    (Math.min((5 / 6) * Math.PI, Math.max(Math.PI / 6, angle)) -
                        Math.PI / 6)
            ),
            2
        );
    }

    /**
     * Calculates the bonus of acute angles.
     */
    private calculateAcuteAngleBonus(angle: number): number {
        return 1 - this.calculateWideAngleBonus(angle);
    }
}
