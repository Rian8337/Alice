import { Vector2 } from "../../mathutil/Vector2";
import { HitObject } from "./HitObject";

/**
 * Represents a spinner in a beatmap.
 *
 * All we need from spinners is their duration. The
 * position of a spinner is always at 256x192.
 */
export class Spinner extends HitObject {
    /**
     * The duration of the spinner.
     */
    readonly duration: number;

    constructor(values: { startTime: number; type: number; duration: number }) {
        super({
            startTime: values.startTime,
            type: values.type,
            position: new Vector2({ x: 256, y: 192 }),
        });
        this.duration = values.duration;
    }

    override toString(): string {
        return `Position: [${this.position.x}, ${this.position.y}], duration: ${this.duration}`;
    }
}
