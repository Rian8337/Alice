import { Vector } from '../../utils/Vector';
import { HitObject } from './HitObject';

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
    public readonly duration: number;

    constructor(values: {
        time: number,
        type: number,
        duration: number
    }) {
        super({
            time: values.time,
            type: values.type,
            pos: new Vector({x: 256, y: 192})
        });
        this.duration = values.duration;
    }

    toString(): string {
        return `Position: [${this.pos.x}, ${this.pos.y}], duration: ${this.duration}`;
    }
}