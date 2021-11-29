import { BaseDocument } from "../BaseDocument";

/**
 * Represents a mappool length for tournament.
 */
export interface DatabaseTournamentMapLengthInfo extends BaseDocument {
    /**
     * The ID of the mappool.
     */
    poolid: string;
    
    /**
     * The beatmaps in the mappool.
     * 
     * The first element is the pick, the second element is
     * the map length, in seconds.
     * 
     * In old entries, the length is in string, therefore
     * using `parseInt()` is advised.
     */
    map: [string, number | string][];
}