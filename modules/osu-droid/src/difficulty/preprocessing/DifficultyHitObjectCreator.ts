import { HitObject } from "../../beatmap/hitobjects/HitObject";
import { Vector2 } from "../../mathutil/Vector2";
import { DifficultyHitObject } from "./DifficultyHitObject";
import { Slider } from "../../beatmap/hitobjects/Slider";
import { Precision } from "../../utils/Precision";
import { modes } from "../../constants/modes";
import { Spinner } from "../../beatmap/hitobjects/Spinner";

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
     * The radius of hitobjects.
     */
    private hitObjectRadius: number = 0;

    /**
     * The base normalized radius of hitobjects.
     */
    private readonly normalizedRadius: number = 52;

    /**
     * Generates difficulty hitobjects for difficulty calculation.
     */
    generateDifficultyObjects(params: {
        objects: HitObject[]
        circleSize: number,
        speedMultiplier: number,
        mode: modes
    }): DifficultyHitObject[] {
        this.objects = params.objects;
        const circleSize: number = params.circleSize;

        this.hitObjectRadius = 32 * (1 - 0.7 * (circleSize - 5) / 5);

        const scalingFactor: number = this.getScalingFactor(params.mode);

        const difficultyObjects: DifficultyHitObject[] = [];

        for (let i = 0; i < this.objects.length; ++i) {
            const object: DifficultyHitObject = new DifficultyHitObject(this.objects[i]);
            object.radius = this.hitObjectRadius;

            const lastObject: DifficultyHitObject = difficultyObjects[i - 1];
            const lastLastObject: DifficultyHitObject = difficultyObjects[i - 2];

            if (lastObject) {
                if (lastObject.object instanceof Slider) {
                    this.calculateSliderCursorPosition(lastObject.object);
                    object.travelDistance = lastObject.object.lazyTravelDistance * scalingFactor;
                }

                const lastCursorPosition: Vector2 = this.getEndCursorPosition(lastObject.object);

                // Don't need to jump to reach spinners
                if (!(object.object instanceof Spinner)) {
                    object.jumpVector = object.object.stackedPosition.scale(scalingFactor)
                        .subtract(lastCursorPosition.scale(scalingFactor));
                }

                object.deltaTime = (object.object.startTime - lastObject.object.startTime) / params.speedMultiplier;
                object.strainTime = Math.max(25, object.deltaTime);
                object.startTime = object.object.startTime / params.speedMultiplier;

                if (lastLastObject) {
                    const lastLastCursorPosition: Vector2 = this.getEndCursorPosition(lastLastObject.object);

                    const v1: Vector2 = lastLastCursorPosition.subtract(lastObject.object.stackedPosition);
                    const v2: Vector2 = object.object.stackedPosition.subtract(lastCursorPosition);
                    const dot: number = v1.dot(v2);
                    const det: number = v1.x * v2.y - v1.y * v2.x;

                    object.angle = Math.abs(Math.atan2(det, dot));
                }
            }

            difficultyObjects.push(object);
        }

        return difficultyObjects;
    }

    /**
     * Calculates a slider's cursor position.
     */
    private calculateSliderCursorPosition(slider: Slider): void {
        if (slider.lazyEndPosition !== null && slider.lazyEndPosition !== undefined) {
            return;
        }
        slider.lazyEndPosition = slider.stackedPosition;

        // Stop here if the slider has too short duration due to float number limitation.
        // Incredibly close start and end time fluctuates travel distance and lazy
        // end position heavily, which we do not want to happen.
        //
        // In the real game, this shouldn't happen. Perhaps we need to reinvestigate this
        // in the future.
        if (Precision.almostEqualsNumber(slider.startTime, slider.endTime)) {
            return;
        }

        const approxFollowCircleRadius: number = this.hitObjectRadius * 3;

        // Skip the head circle
        const scoringTimes: number[] = slider.nestedHitObjects.slice(1, slider.nestedHitObjects.length).map(t => {return t.startTime;});
        scoringTimes.forEach(time => {
            let progress: number = (time - slider.startTime) / slider.spanDuration;
            if (progress % 2 >= 1) {
                progress = 1 - progress % 1;
            } else {
                progress %= 1;
            }

            const diff: Vector2 = slider.stackedPosition.add(slider.path.positionAt(progress)).subtract(slider.lazyEndPosition as Vector2);
            let dist: number = diff.length;

            if (dist > approxFollowCircleRadius) {
                // The cursor would be outside the follow circle, we need to move it
                diff.normalize(); // Obtain direction of diff
                dist -= approxFollowCircleRadius;
                slider.lazyEndPosition = (slider.lazyEndPosition as Vector2).add(diff.scale(dist));
                slider.lazyTravelDistance += dist;
            }
        });
    }

    /**
     * Gets the scaling factor of a radius.
     * 
     * @param mode The mode to get the scaling factor from.
     * @param radius The radiust to get the scaling factor from.
     */
    private getScalingFactor(mode: modes): number {
        // We will scale distances by this factor, so we can assume a uniform CircleSize among beatmaps.
        let scalingFactor: number = this.normalizedRadius / this.hitObjectRadius;

        // High circle size (small CS) bonus
        switch (mode) {
            case modes.droid:
                if (this.hitObjectRadius < this.DROID_CIRCLESIZE_BUFF_THRESHOLD) {
                    scalingFactor *= 1 +
                        Math.min(this.DROID_CIRCLESIZE_BUFF_THRESHOLD - this.hitObjectRadius, 20) / 40;
                }
                break;
            case modes.osu:
                if (this.hitObjectRadius < this.PC_CIRCLESIZE_BUFF_THRESHOLD) {
                    scalingFactor *= 1 +
                        Math.min(this.PC_CIRCLESIZE_BUFF_THRESHOLD - this.hitObjectRadius, 5) / 50;
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