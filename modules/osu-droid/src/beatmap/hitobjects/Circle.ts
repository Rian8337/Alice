import { Vector } from '../../utils/Vector';
import { HitObject } from './HitObject';

/**
 * Represents a circle in a beatmap.
 * 
 * All we need from circles is their position. All positions
 * stored in the objects are in playfield coordinates (512*384
 * rectangle).
 */
export class Circle extends HitObject {
    constructor(values: {
        time: number,
        type: number,
        pos: Vector
    }) {
        super(values);
    }

    toString(): string {
        return `Position: [${this.pos.x}, ${this.pos.y}]`;
    }
}