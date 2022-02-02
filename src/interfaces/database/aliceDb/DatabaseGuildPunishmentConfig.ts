import { Snowflake } from "discord.js";
import { RoleTimeoutPermission } from "@alice-interfaces/moderation/RoleTimeoutPermission";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents a guild's punishment configuration.
 */
export interface DatabaseGuildPunishmentConfig extends BaseDocument {
    /**
     * The ID of the guild.
     */
    guildID: Snowflake;

    /**
     * The ID of the guild's log channel.
     */
    logChannel: Snowflake;

    /**
     * Configuration for roles that are allowed to timeout members.
     */
    allowedTimeoutRoles: RoleTimeoutPermission[];

    /**
     * Roles that cannot be timeouted.
     */
    immuneTimeoutRoles: Snowflake[];
}
