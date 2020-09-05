import { Vector } from '../../utils/Vector';
import { HitObject } from './HitObject';

/**
 * Represents a slider in a beatmap.
 *
 * This is needed to calculate max combo as we need to compute slider ticks.
 * 
 * The beatmap stores the distance travelled in one repetition and
 * the number of repetitions. This is enough to calculate distance
 * per tick using timing information and slider velocity.
 * 
 * Note that 1 repetition means no repeats (1 loop).
 */
export class Slider extends HitObject {
    /**
     * The travel distance of the slider in osu!pixels.
     */
    public readonly distance: number;

    /**
     * The repetition amount of the slider. Note that 1 repetition means no repeats (1 loop).
     */
    public readonly repetitions: number;
    
    constructor(values: {
        time: number,
        type: number,
        pos: Vector,
        distance: number,
        repetitions: number
    }) {
        super(values);
        this.distance = values.distance || 0;
        this.repetitions = values.repetitions || 1;
    }

    toString(): string {
        return `Position: [${this.pos.x}, ${this.pos.y}], distance: ${this.distance.toFixed(2)}, repetitions: ${this.repetitions}`;
    }
}