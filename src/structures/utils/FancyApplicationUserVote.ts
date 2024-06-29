import { Snowflake } from "discord.js";

/**
 * Represents a user's vote in a fancy application vote.
 */
export interface FancyApplicationUserVote {
    /**
     * The ID of the user.
     */
    readonly discordId: Snowflake;

    /**
     * Whether the user answered "Yes".
     */
    answer: boolean;

    /**
     * The user's reason for voting "No", if applicable.
     */
    reason?: string;
}
