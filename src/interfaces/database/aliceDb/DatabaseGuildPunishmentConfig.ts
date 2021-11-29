import { Snowflake } from "discord.js";
import { Mute } from "@alice-interfaces/moderation/Mute";
import { RoleMutePermission } from "@alice-interfaces/moderation/RoleMutePermission";
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
     * Configuration for roles that are allowed to use mute commands.
     */
    allowedMuteRoles: RoleMutePermission[];

    /**
     * Roles that cannot be muted.
     */
    immuneMuteRoles: Snowflake[];

    /**
     * Temporary mutes that are currently active in the guild.
     */
    currentMutes: Mute[];
}