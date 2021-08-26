import { BaseDocument } from "../BaseDocument";

/**
 * Represents a mappool for tournament.
 */
export interface DatabaseTournamentMappool extends BaseDocument {
    /**
     * The ID of the mappool.
     */
    poolid: string;

    /**
     * Whether this mappool enforces the PR mod.
     */
    forcePR: boolean;

    /**
     * The beatmaps in this tournament. The information in this array is ordered
     * per index like this:
     * 
     * - `0`: The mode this beatmap is for (`nm`, `hd`, `hr`, `dt`, `fm`, or `tb`).
     * - `1`: The name of the beatmap.
     * - `2`: The maximum score of the beatmap with their respective mode applied. In old mappools, this is a string, else it is a number, therefore it is recommended to use `parseInt()` when working with this field.
     * - `3`: The MD5 hash of the beatmap. Only available for new mappools.
     * - `4`: The score portion of the beatmap. This is the decimal value of how much will the ScoreV1 gained in this beatmap take account into the final ScoreV2 calculation.
     * - `5`: The accuracy portion of the beatmap. Like the score portion, this is the decimal value of how much will the accuracy gained in this beatmap take account into the final ScoreV2 calculation.
     */
    map: (string | number)[];
};