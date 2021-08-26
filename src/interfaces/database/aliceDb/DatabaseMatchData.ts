import { RoundScore } from "@alice-interfaces/match/MatchScore";
import { PlayerResult } from "@alice-interfaces/match/PlayerResult";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents a tournament match's result.
 */
export interface DatabaseMatchData extends BaseDocument {
    /**
     * The ID of the match.
     */
    matchid: string;

    /**
     * The players in the match.
     * 
     * If this is a team match, the teams they are assigned in is based on the index they are placed in this array.
     * Players in even indexes will be assigned to the first team, while players in odd indexes will be assigned to the second team.
     */
    players: string[];

    /**
     * The banned picks in the match.
     */
    bans: string[];

    /**
     * The results of the match.
     * 
     * If this is a team match, the team assignment is similar
     * to that of the `players` field.
     */
    result: PlayerResult[];

    /**
     * The scores of the match.
     */
    scores: RoundScore[];
};