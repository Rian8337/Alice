import { HitObject } from "../../beatmap/hitobjects/HitObject";
import { Vector2 } from "../../mathutil/Vector2";
import { DifficultyHitObject } from "./DifficultyHitObject";
import { Slider } from "../../beatmap/hitobjects/Slider";
import { Precision } from "../../utils/Precision";
import { modes } from "../../constants/modes";
import { Spinner } from "../../beatmap/hitobjects/Spinner";
import { RepeatPoint } from "../../beatmap/hitobjects/sliderObjects/RepeatPoint";

/**
 * A converter used to convert normal hitobjects into difficulty hitobjects.
 */
export class DifficultyHitObjectCreator {
    /**
     * The hitobjects to be generated to difficulty hitobjects.
     */
    private objects: HitObject[] = [];

    /**
     * The threshold for small circle buff for osu!droid.
     */
    private readonly DROID_CIRCLESIZE_BUFF_THRESHOLD: number = 52.5;

    /**
     * The threshold for small circle buff for osu!standard.
     */
    private readonly PC_CIRCLESIZE_BUFF_THRESHOLD: number = 30;

    /**
     * The gamemode this creator is creating for.
     */
    private mode: modes = modes.osu;

    /**
     * The base normalized radius of hitobjects.
     */
    private readonly normalizedRadius: number = 50;

    private readonly maximumSliderRadius: number = this.normalizedRadius * 2.4;

    private readonly assumedSliderRadius: number = this.normalizedRadius * 1.8;

    private readonly minDeltaTime: number = 25;

    /**
     * Generates difficulty hitobjects for difficulty calculation.
     */
    generateDifficultyObjects(params: {
        objects: HitObject[];
        circleSize: number;
        speedMultiplier: number;
        mode: modes;
    }): DifficultyHitObject[] {
        this.objects = params.objects;
        this.mode = params.mode;

        const circleSize: number = params.circleSize;

        const scale: number = (1 - (0.7 * (circleSize - 5)) / 5) / 2;

        this.objects[0].scale = scale;

        const scalingFactor: number = this.getScalingFactor(
            this.objects[0].radius
        );

        const difficultyObjects: DifficultyHitObject[] = [];

        for (let i = 0; i < this.objects.length; ++i) {
            const object: DifficultyHitObject = new DifficultyHitObject(
                this.objects[i]
            );
            object.object.scale = scale;

            if (object.object instanceof Slider) {
                object.object.nestedHitObjects.forEach((h) => {
                    h.scale = scale;
                });
            }

            const lastObject: DifficultyHitObject = difficultyObjects[i - 1];
            const lastLastObject: DifficultyHitObject =
                difficultyObjects[i - 2];

            if (!lastObject) {
                difficultyObjects.push(object);
                continue;
            }

            object.deltaTime =
                (object.object.startTime - lastObject.object.startTime) /
                params.speedMultiplier;
            // Cap to 25ms to prevent difficulty calculation breaking from simulatenous objects.
            object.strainTime = Math.max(this.minDeltaTime, object.deltaTime);
            object.startTime = object.object.startTime / params.speedMultiplier;

            if (
                object.object instanceof Spinner ||
                lastObject.object instanceof Spinner
            ) {
                difficultyObjects.push(object);
                continue;
            }

            const lastCursorPosition: Vector2 = this.getEndCursorPosition(
                lastObject.object
            );

            object.jumpDistance = object.object.stackedPosition
                .scale(scalingFactor)
                .subtract(lastCursorPosition.scale(scalingFactor)).length;

            if (lastObject.object instanceof Slider) {
                this.calculateSliderCursorPosition(lastObject.object);
                object.travelDistance = lastObject.object.lazyTravelDistance;
                object.travelTime = Math.max(
                    lastObject.object.lazyTravelTime / params.speedMultiplier,
                    this.minDeltaTime
                );
                object.movementTime = Math.max(
                    object.strainTime - object.travelTime,
                    this.minDeltaTime
                );

                // Jump distance from the slider tail to the next object, as opposed to the lazy position of JumpDistance.
                const tailJumpDistance: number =
                    lastObject.object.tailCircle.stackedPosition.subtract(
                        object.object.stackedPosition
                    ).length * scalingFactor;

                // For hitobjects which continue in the direction of the slider, the player will normally follow through the slider,
                // such that they're not jumping from the lazy position but rather from very close to (or the end of) the slider.
                // In such cases, a leniency is applied by also considering the jump distance from the tail of the slider, and taking the minimum jump distance.
                // Additional distance is removed based on position of jump relative to slider follow circle radius.
                // JumpDistance is the leniency distance beyond the assumedSliderRadius. tailJumpDistance is maximumSliderRadius since the full distance of radial leniency is still possible.
                object.movementDistance = Math.max(
                    0,
                    Math.min(
                        object.jumpDistance -
                            (this.maximumSliderRadius -
                                this.assumedSliderRadius),
                        tailJumpDistance - this.maximumSliderRadius
                    )
                );
            } else {
                object.movementTime = object.strainTime;
                object.movementDistance = object.jumpDistance;
            }

            if (lastLastObject && !(lastLastObject.object instanceof Spinner)) {
                const lastLastCursorPosition: Vector2 =
                    this.getEndCursorPosition(lastLastObject.object);

                const v1: Vector2 = lastLastCursorPosition.subtract(
                    lastObject.object.stackedPosition
                );
                const v2: Vector2 =
                    object.object.stackedPosition.subtract(lastCursorPosition);
                const dot: number = v1.dot(v2);
                const det: number = v1.x * v2.y - v1.y * v2.x;

                object.angle = Math.abs(Math.atan2(det, dot));
            }

            difficultyObjects.push(object);
        }

        return difficultyObjects;
    }

    /**
     * Calculates a slider's cursor position.
     */
    private calculateSliderCursorPosition(slider: Slider): void {
        if (slider.lazyEndPosition) {
            return;
        }

        // Droid doesn't have a legacy slider tail. Since beatmap parser defaults slider tail
        // to legacy slider tail, it needs to be changed to real slider tail first.
        if (this.mode === modes.droid) {
            slider.tailCircle.startTime += Slider.legacyLastTickOffset;
            slider.tailCircle.endTime += Slider.legacyLastTickOffset;

            slider.nestedHitObjects.sort((a, b) => {
                return a.startTime - b.startTime;
            });
        }

        // Not using slider.endTime due to legacy last tick offset.
        slider.lazyTravelTime =
            slider.nestedHitObjects.at(-1)!.startTime - slider.startTime;

        let endTimeMin: number = slider.lazyTravelTime / slider.spanDuration;
        if (endTimeMin % 2 >= 1) {
            endTimeMin = 1 - (endTimeMin % 1);
        } else {
            endTimeMin %= 1;
        }

        // Temporary lazy end position until a real result can be derived.
        slider.lazyEndPosition = slider.stackedPosition.add(
            slider.path.positionAt(endTimeMin)
        );

        // Stop here if the slider has too short duration due to float number limitation.
        // Incredibly close start and end time fluctuates travel distance and lazy
        // end position heavily, which we do not want to happen.
        //
        // In the real game, this shouldn't happen. Perhaps we need to reinvestigate this
        // in the future.
        if (Precision.almostEqualsNumber(slider.startTime, slider.endTime)) {
            return;
        }

        let currentCursorPosition: Vector2 = slider.stackedPosition;
        const scalingFactor: number = this.normalizedRadius / slider.radius;

        for (let i = 1; i < slider.nestedHitObjects.length; ++i) {
            const currentMovementObject: HitObject = slider.nestedHitObjects[i];

            let currentMovement: Vector2 =
                currentMovementObject.stackedPosition.subtract(
                    currentCursorPosition
                );
            let currentMovementLength: number =
                scalingFactor * currentMovement.length;

            // The amount of movement required so that the cursor position needs to be updated.
            let requiredMovement: number = this.assumedSliderRadius;

            if (i === slider.nestedHitObjects.length - 1) {
                // The end of a slider has special aim rules due to the relaxed time constraint on position.
                // There is both a lazy end position as well as the actual end slider position. We assume the player takes the simpler movement.
                // For sliders that are circular, the lazy end position may actually be farther away than the sliders' true end.
                // This code is designed to prevent buffing situations where lazy end is actually a less efficient movement.
                const lazyMovement: Vector2 = slider.lazyEndPosition.subtract(
                    currentCursorPosition
                );

                if (lazyMovement.length < currentMovement.length) {
                    currentMovement = lazyMovement;
                }

                currentMovementLength = scalingFactor * currentMovement.length;
            } else if (currentMovementObject instanceof RepeatPoint) {
                // For a slider repeat, assume a tighter movement threshold to better assess repeat sliders.
                requiredMovement = this.normalizedRadius;
            }

            if (currentMovementLength > requiredMovement) {
                // This finds the positional delta from the required radius and the current position,
                // and updates the currentCursorPosition accordingly, as well as rewarding distance.
                currentCursorPosition = currentCursorPosition.add(
                    currentMovement.scale(
                        (currentMovementLength - requiredMovement) /
                            currentMovementLength
                    )
                );
                currentMovementLength *=
                    (currentMovementLength - requiredMovement) /
                    currentMovementLength;
                slider.lazyTravelDistance += currentMovementLength;
            }

            if (i === slider.nestedHitObjects.length - 1) {
                slider.lazyEndPosition = currentCursorPosition;
            }
        }

        // Bonus for repeat sliders until a better per nested object strain system can be achieved.
        if (this.mode === modes.droid) {
            slider.lazyTravelDistance *= Math.pow(
                1 + (slider.repetitions - 1) / 4,
                1 / 4
            );
        } else {
            slider.lazyTravelDistance *= Math.pow(
                1 + (slider.repetitions - 1) / 2.5,
                1 / 2.5
            );
        }
    }

    /**
     * Gets the scaling factor of a radius.
     *
     * @param radius The radius to get the scaling factor from.
     */
    private getScalingFactor(radius: number): number {
        // We will scale distances by this factor, so we can assume a uniform CircleSize among beatmaps.
        let scalingFactor: number = this.normalizedRadius / radius;

        // High circle size (small CS) bonus
        switch (this.mode) {
            case modes.droid:
                if (radius < this.DROID_CIRCLESIZE_BUFF_THRESHOLD) {
                    scalingFactor *=
                        1 +
                        Math.min(
                            this.DROID_CIRCLESIZE_BUFF_THRESHOLD - radius,
                            20
                        ) /
                            40;
                }
                break;
            case modes.osu:
                if (radius < this.PC_CIRCLESIZE_BUFF_THRESHOLD) {
                    scalingFactor *=
                        1 +
                        Math.min(
                            this.PC_CIRCLESIZE_BUFF_THRESHOLD - radius,
                            5
                        ) /
                            50;
                }
        }

        return scalingFactor;
    }

    /**
     * Returns the end cursor position of a hitobject.
     */
    private getEndCursorPosition(object: HitObject): Vector2 {
        let pos: Vector2 = object.stackedPosition;

        if (object instanceof Slider) {
            this.calculateSliderCursorPosition(object);
            pos = object.lazyEndPosition ?? pos;
        }

        return pos;
    }
}
