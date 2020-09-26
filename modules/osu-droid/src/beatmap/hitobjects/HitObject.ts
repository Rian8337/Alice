import { objectTypes } from '../../constants/objectTypes';
import { Vector } from '../../utils/Vector';

/**
 * Represents a hitobject in a beatmap.
 */
export abstract class HitObject {
    /**
     * The start time of the object in milliseconds.
     */
    public readonly time: number;

    /**
     * The bitwise type of the hitobject (circle/slider/spinner).
     */
    public readonly type: objectTypes;

    /**
     * The position of the hitobject in osu!pixels.
     */
    public readonly pos: Vector;

    /**
     * Whether or not this hitobject represents a new combo in the beatmap.
     */
    public readonly isNewCombo: boolean;

    constructor(values: {
        time: number,
        pos: Vector,
        type: number
    }) {
        this.time = values.time || 0;
        this.type = values.type || 0;
        this.pos = values.pos || [0, 0];
        this.isNewCombo = !!(this.type & 1 << 2);
    }

    /**
     * Returns the hitobject type.
     */
    typeStr(): string {
        let res = '';
        if (this.type & objectTypes.circle) {
            res += "circle | ";
        }
        if (this.type & objectTypes.slider) {
            res += "slider | ";
        }
        if (this.type & objectTypes.spinner) {
            res += "spinner | ";
        }
        return res.substring(0, Math.max(0, res.length - 3));
    }

    /**
     * Returns the string representative of the class.
     */
    abstract toString(): string;
}