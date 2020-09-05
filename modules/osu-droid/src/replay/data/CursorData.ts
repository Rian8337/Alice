import { movementType } from "../../constants/movementType";

/**
 * Represents a cursor in an osu!droid replay.
 * 
 * Stores cursor movement data such as x and y coordinates, movement size, etc.
 * 
 * This is used when analyzing replays using replay analyzer.
 */
export class CursorData {
    /**
     * The movement size of the cursor.
     */
    public size: number;

    /**
     * The time during which this cursor instance is active in milliseconds.
     */
    public time: number[];

    /**
     * The x coordinates of this cursor instance in osu!pixels.
     */
    public x: number[];

    /**
     * The y coordinates of this cursor instance in osu!pixels.
     */
    public y: number[];

    /**
     * The hit results of this cursor instance.
     */
    public id: movementType[];

    constructor(values: {
        size: number,
        time: number[],
        x: number[],
        y: number[],
        id: movementType[]
    }) {
        this.size = values.size;
        this.time = values.time;
        this.x = values.x;
        this.y = values.y;
        this.id = values.id;
    }
}