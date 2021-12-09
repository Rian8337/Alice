import { movementType } from "../../constants/movementType";

/**
 * Contains information about a cursor instance.
 */
export interface CursorInformation {
    /**
     * The movement size of the cursor instance.
     */
    size: number;

    /**
     * The time during which this cursor instance is active in milliseconds.
     */
    time: number[];

    /**
     * The x coordinates of this cursor instance in osu!pixels.
     */
    x: number[];

    /**
     * The y coordinates of this cursor instance in osu!pixels.
     */
    y: number[];

    /**
     * The hit results of this cursor instance.
     */
    id: number[];
}

/**
 * Represents a cursor instance in an osu!droid replay.
 *
 * Stores cursor movement data such as x and y coordinates, movement size, etc.
 *
 * This is used when analyzing replays using replay analyzer.
 */
export class CursorData implements CursorInformation {
    size: number;
    readonly time: number[];
    readonly x: number[];
    readonly y: number[];
    readonly id: movementType[];

    constructor(values: CursorInformation) {
        this.size = values.size;
        this.time = values.time;
        this.x = values.x;
        this.y = values.y;
        this.id = values.id;
    }
}
