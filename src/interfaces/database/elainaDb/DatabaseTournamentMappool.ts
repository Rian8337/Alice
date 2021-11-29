import { MainBeatmapData } from "@alice-types/tournament/MainBeatmapData";
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
     * The beatmaps in this tournament.
     */
    map: MainBeatmapData[];
}