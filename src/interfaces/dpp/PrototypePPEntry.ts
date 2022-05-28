import { PPEntry } from "./PPEntry";

export interface PrototypePPEntry extends PPEntry {
    /**
     * The pp before the score was recalculated.
     */
    prevPP: number;

    /**
     * The cursor indexes of each hitobject.
     */
    cursorIndexes: number[];
}
