import { objectTypes } from "../../constants/objectTypes";
import { HitObject } from "../../beatmap/hitobjects/HitObject";
import { Vector2 } from "../../mathutil/Vector2";
import { DifficultyHitObject } from "../../beatmap/hitobjects/DifficultyHitObject";
import { Slider } from "../../beatmap/hitobjects/Slider";

/**
 * A converter used to convert normal hitobjects into difficulty hitobjects.
 */
export class DifficultyHitObjectCreator {
    /**
     * The hitobject to be generated to difficulty hitobject.
     */
    private objects: HitObject[] = [];

    /**
     * The threshold for small circle buff.
     */
    private readonly CIRCLESIZE_BUFF_THRESHOLD: number = 30;

    /**
     * The radius of hitobjects.
     */
    private hitObjectRadius: number = 0;

    /**
     * Generates difficulty hitobjects for difficulty calculation.
     */
    generateDifficultyObjects(params: {
        objects: HitObject[]
        circleSize: number,
        speedMultiplier: number
    }): DifficultyHitObject[] {
        this.objects = params.objects;
        const circleSize: number = params.circleSize;

        this.hitObjectRadius = 32 * (1 - 0.7 * (circleSize - 5) / 5);
        let scalingFactor: number = 52 / this.hitObjectRadius;

        // apply stacked position
        this.objects.forEach(hitObject => {
            hitObject.calculateStackedPosition(this.hitObjectRadius / 64);
        });

        // high circle size (small CS) bonus
        if (this.hitObjectRadius < this.CIRCLESIZE_BUFF_THRESHOLD) {
            scalingFactor *= 1 +
                Math.min(this.CIRCLESIZE_BUFF_THRESHOLD - this.hitObjectRadius, 5) / 50;
        }

        const scalingVector: Vector2 = new Vector2({x: scalingFactor, y: scalingFactor});

        const difficultyObjects: DifficultyHitObject[] = [];

        for (let i = 0; i < this.objects.length; ++i) {
            const difficultyObject: DifficultyHitObject = new DifficultyHitObject(this.objects[i]);
            difficultyObject.radius = this.hitObjectRadius;

            if (i >= 1) {
                const lastObject: DifficultyHitObject = difficultyObjects[i - 1];
                if (lastObject.object instanceof Slider) {
                    this.calculateSliderCursorPosition(lastObject.object);
                    difficultyObject.travelDistance = lastObject.object.lazyTravelDistance as number * scalingFactor;
                }
            }

            const lastCursorPosition: Vector2 = i >= 1 ? this.getEndCursorPosition(this.objects[i - 1]) : new Vector2({x: 0, y: 0});
            if (i > 0 && !(difficultyObject.object.type & objectTypes.spinner)) {
                difficultyObject.jumpDistance = difficultyObject.object.stackedPosition.multiply(scalingVector)
                    .subtract(lastCursorPosition.multiply(scalingVector))
                    .getLength();
            }

            if (i > 0) {
                difficultyObject.deltaTime = (difficultyObject.object.startTime - difficultyObjects[i - 1].object.startTime) / params.speedMultiplier;
                difficultyObject.strainTime = Math.max(50, difficultyObject.deltaTime);
            }

            if (i >= 2) {
                const prev1: DifficultyHitObject = difficultyObjects[i - 1];
                const prev2: DifficultyHitObject = difficultyObjects[i - 2];

                const prev2CursorPosition: Vector2 = this.getEndCursorPosition(prev2.object);

                const v1: Vector2 = prev2CursorPosition.subtract(prev1.object.stackedPosition);
                const v2: Vector2 = difficultyObject.object.stackedPosition.subtract(lastCursorPosition);
                const dot: number = v1.dot(v2);
                const det: number = v1.x * v2.y - v1.y * v2.x;
                difficultyObject.angle = Math.abs(Math.atan2(det, dot));
            } else {
                difficultyObject.angle = null;
            }
            difficultyObjects.push(difficultyObject);
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
        slider.lazyTravelDistance = 0;

        const approxFollowCircleRadius: number = this.hitObjectRadius * 3;

        const scoringTimes: number[] = slider.nestedHitObjects.slice(1, slider.nestedHitObjects.length).map(t => {return t.startTime;});
        scoringTimes.forEach(time => {
            let progress: number = (time - slider.startTime) / slider.spanDuration;
            if (progress % 2 >= 1) {
                progress = 1 - progress % 1;
            } else {
                progress = progress % 1;
            }

            const diff: Vector2 = slider.stackedPosition.add(slider.path.positionAt(progress)).subtract(slider.lazyEndPosition as Vector2);
            let dist: number = diff.getLength();

            if (dist > approxFollowCircleRadius) {
                diff.normalize();
                dist -= approxFollowCircleRadius;
                slider.lazyEndPosition = (slider.lazyEndPosition as Vector2).add(diff.scale(dist));
                slider.lazyTravelDistance = slider.lazyTravelDistance === undefined ? dist : slider.lazyTravelDistance += dist;
            }
        });
    }

    /**
     * Returns the end cursor position of a hitobject.
     */
    private getEndCursorPosition(object: HitObject): Vector2 {
        let pos: Vector2 = object.stackedPosition;

        if (object instanceof Slider) {
            this.calculateSliderCursorPosition(object);
            pos = object.lazyEndPosition !== null && object.lazyEndPosition !== undefined ? object.lazyEndPosition : pos;
        }

        return pos;
    }
}