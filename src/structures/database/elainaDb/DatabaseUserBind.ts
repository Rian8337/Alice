import { Snowflake } from "discord.js";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents a Discord user who has at least one osu!droid account bound.
 */
export interface DatabaseUserBind extends BaseDocument {
    /**
     * The Discord ID of the user.
     */
    discordid: Snowflake;

    /**
     * The UID of the osu!droid account bound to the user.
     */
    uid: number;

    /**
     * The username of the osu!droid account bound to the user.
     */
    username: string;

    /**
     * The clan the user is currently in.
     */
    clan?: string;

    /**
     * The epoch time at which the user can join another clan, in seconds.
     */
    joincooldown?: number;

    /**
     * The last clan that the user was in.
     */
    oldclan?: string;

    /**
     * The epoch time at which the user can rejoin their old clan, in seconds.
     */
    oldjoincooldown?: number;

    /**
     * Whether the daily role connection metadata for this user has been completed.
     */
    dailyRoleMetadataUpdateComplete?: boolean;
}
