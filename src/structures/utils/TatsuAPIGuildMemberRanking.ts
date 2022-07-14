import { Snowflake } from "discord.js";

/**
 * Represents an API response from Tatsu API containing information about guild member ranking.
 */
export interface TatsuAPIGuildMemberRanking {
    /**
     * The ID of the guild.
     */
    readonly guild_id: Snowflake;

    /**
     * The rank of the user in the guild.
     */
    readonly rank: number;

    /**
     * The Tatsu XP of the user in the guild.
     */
    readonly score: number;

    /**
     * The ID of the user.
     */
    readonly user_id: Snowflake;
}
