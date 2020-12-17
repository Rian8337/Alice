import { hitResult } from "../../constants/hitResult";

/**
 * Represents a hitobject in an osu!droid replay.
 * 
 * Stores information about hitobjects in an osu!droid replay such as hit offset, tickset, and hit result.
 * 
 * This is used when analyzing replays using replay analyzer.
 */
export class ReplayObjectData {
    /**
     * The offset of which the hitobject was hit in milliseconds.
     */
    accuracy: number;

    /**
     * The tickset of the hitobject.
     */
    tickset: boolean[];

    /**
     * The bitwise hit result of the hitobject.
     */
    result: hitResult;

    constructor(values: {
        /**
         * The offset of which the hitobject was hit in milliseconds.
         */
        accuracy: number,

        /**
         * THe tickset of the hitobject.
         */
        tickset: boolean[],

        /**
         * The bitwise hit result of the hitobject.
         */
        result: hitResult
    }) {
        this.accuracy = values.accuracy;
        this.tickset = values.tickset;
        this.result = values.result;
    }
}