import { objectTypes } from "../../constants/objectTypes";
import { Vector2 } from "../../mathutil/Vector2";

/**
 * Represents a hitobject in a beatmap.
 */
export abstract class HitObject {
    /**
     * The start time of the hitobject in milliseconds.
     */
    startTime: number;

    /**
     * The bitwise type of the hitobject (circle/slider/spinner).
     */
    readonly type: objectTypes;

    /**
     * The position of the hitobject in osu!pixels.
     */
    readonly position: Vector2;

    /**
     * The end position of the hitobject in osu!pixels.
     */
    readonly endPosition: Vector2;

    /**
     * The end time of the hitobject.
     */
    endTime: number;

    /**
     * The stacked position of the hitobject.
     */
    get stackedPosition(): Vector2 {
        return this.position.add(this.stackOffset);
    }

    /**
     * The stacked end position of the hitobject.
     */
    get stackedEndPosition(): Vector2 {
        return this.endPosition.add(this.stackOffset);
    }

    /**
     * The stack vector to calculate offset for stacked positions.
     */
    private get stackOffset(): Vector2 {
        const coordinate: number = this.stackHeight * this.scale * -6.4;

        return new Vector2({ x: coordinate, y: coordinate });
    }

    /**
     * Whether or not this hitobject represents a new combo in the beatmap.
     */
    readonly isNewCombo: boolean;

    /**
     * The stack height of the hitobject.
     */
    stackHeight: number = 0;

    /**
     * The scale used to calculate stacked position and radius.
     */
    scale: number = 1;

    /**
     * The radius of the hitobject.
     */
    get radius(): number {
        return 64 * this.scale;
    }

    constructor(values: {
        startTime: number;
        position: Vector2;
        type?: number;
        endTime?: number;
        endPosition?: Vector2;
    }) {
        this.startTime = values.startTime;
        this.endTime = values.endTime ?? values.startTime;
        this.type = values.type ?? objectTypes.circle;
        this.position = values.position;
        this.endPosition = values.endPosition ?? this.position;
        this.isNewCombo = !!(this.type & (1 << 2));
    }

    /**
     * Returns the hitobject type.
     */
    typeStr(): string {
        let res = "";
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
