import { HitObject } from "../HitObject";
import { Vector2 } from "../../../mathutil/Vector2";

/**
 * Represents a slider tick in a slider.
 */
export class SliderTick extends HitObject {
    /**
     * The index of the span at which this slider tick lies.
     */
    readonly spanIndex: number;

    /**
     * The start time of the span at which this slider tick lies.
     */
    readonly spanStartTime: number;

    constructor(values: {
        position: Vector2;
        startTime: number;
        spanIndex: number;
        spanStartTime: number;
    }) {
        super({
            startTime: values.startTime,
            position: values.position,
        });

        this.spanIndex = values.spanIndex;
        this.spanStartTime = values.spanStartTime;
    }

    override toString(): string {
        return `Position: [${this.position.x}, ${this.position.y}], span index: ${this.spanIndex}, span start time: ${this.spanStartTime}`;
    }
}
