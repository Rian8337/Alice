import { DisabledCommand } from "@alice-interfaces/moderation/DisabledCommand";
import { DisabledEventUtil } from "@alice-interfaces/moderation/DisabledEventUtil";
import { GuildChannelSettings } from "@alice-interfaces/moderation/GuildChannelSettings";
import { Snowflake } from "discord.js";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents a database entry of guild settings with respect to the bot.
 */
export interface DatabaseGuildSettings extends BaseDocument {
    /**
     * The ID of the guild.
     */
    id: Snowflake;

    /**
     * Settings for channels in the guild.
     */
    channelSettings: GuildChannelSettings[];

    /**
     * The commands that are disabled in the guild.
     */
    disabledCommands: DisabledCommand[];

    /**
     * The event utilities that are disabled in the guild.
     */
    disabledEventUtils: DisabledEventUtil[];
}
