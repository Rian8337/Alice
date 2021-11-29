import { Snowflake } from "discord.js";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents a tournament match.
 */
export interface DatabaseTournamentMatch extends BaseDocument {
    /**
     * The ID of the match.
     */
    matchid: string;

    /**
     * The ID of the thread channel at which the match proceeds.
     */
    channelId: Snowflake;

    /**
     * The name of the match.
     */
    name: string;

    /**
     * The teams in the match.
     * 
     * The first index is the team name, the second index is the total score gained by the team.
     */
    team: [string, number][];

    /**
     * The players in the match.
     * 
     * The teams they are assigned in is based on the index they are placed in this array.
     * Players in even indexes will be assigned to the first team, while players in odd indexes will be assigned to the second team.
     */
    player: [string, string][];

    /**
     * The status of the match.
     */
    status: "scheduled" | "on-going" | "completed";

    /**
     * The results of the match.
     * 
     * Each players' score are stored in here based on the index they are placed
     * in `player` field.
     */
    result: number[][];
}