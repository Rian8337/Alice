import { BaseDocument } from "../BaseDocument";

/**
 * Represents a beatmap that is considered illegal.
 */
export interface DatabaseIllegalMap extends BaseDocument {
    /**
     * The MD5 hash of the beatmap.
     */
    hash: string;

    /**
     * Whether score deletion for this beatmap is done.
     */
    deleteDone?: boolean;
}
