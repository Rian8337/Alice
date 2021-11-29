import { Snowflake } from "discord.js";

/**
 * Represents a clan member.
 */
export interface ClanMember {
    /**
     * The Discord ID of the clan member.
     */
    id: Snowflake;

    /**
     * The osu!droid UID of the clan member.
     */
    uid: number;

    /**
     * The global rank of the clan member in osu!droid leaderboard.
     */
    rank: number;

    /**
     * Whether this clan member has access to administrative actions (kick, accept, etc).
     */
    hasPermission: boolean;

    /**
     * The epoch time at which the clan member can have a match again, in seconds.
     */
    battle_cooldown: number;
}