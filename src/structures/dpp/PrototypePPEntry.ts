import { PPEntry } from "./PPEntry";

export interface PrototypePPEntry extends PPEntry {
    /**
     * The pp before the score was recalculated.
     */
    prevPP: number;
}
