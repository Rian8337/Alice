import { HitObject } from '../HitObject';
import { Vector2 } from '../../../mathutil/Vector2';

/**
 * Represents a slider tick in a slider.
 */
export class SliderTick extends HitObject {
    /**
     * The index of the slider tick.
     */
    readonly spanIndex: number;

    /**
     * The start time of the slider tick.
     */
    readonly spanStartTime: number;

    constructor(values: {
        position: Vector2,
        startTime: number,
        spanIndex: number,
        spanStartTime: number
    }) {
        super({
            startTime: values.startTime,
            position: values.position,
            type: 0
        });

        this.spanIndex = values.spanIndex;
        this.spanStartTime = values.spanStartTime;
    }

    toString(): string {
        return `Position: [${this.position.x}, ${this.position.y}], span index: ${this.spanIndex}, span start time: ${this.spanStartTime}`;
    }
}