import { Snowflake } from "discord.js";

/**
 * Represents a vote choice.
 */
export interface VoteChoice {
    /**
     * The name of the vote choice.
     */
    choice: string;

    /**
     * The Discord IDs of users who have voted for the choice.
     */
    voters: Snowflake[];
}
