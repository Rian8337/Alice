import { BaseDocument } from "../BaseDocument";
import { TournamentBeatmap } from "structures/tournament/TournamentBeatmap";

/**
 * Represents a mappool for tournament.
 */
export interface DatabaseTournamentMappool extends BaseDocument {
    /**
     * The ID of this tournament pool.
     */
    poolId: string;

    /**
     * The beatmaps this tournament pool has.
     */
    maps: TournamentBeatmap[];
}
