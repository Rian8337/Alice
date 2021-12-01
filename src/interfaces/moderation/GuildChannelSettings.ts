import { Snowflake } from "discord.js";
import { DisabledCommand } from "./DisabledCommand";
import { DisabledEventUtil } from "./DisabledEventUtil";

/**
 * Represents a guild channel's settings with respect to the bot.
 */
export interface GuildChannelSettings {
    /**
     * The ID of the channel.
     */
    id: Snowflake;

    /**
     * The commands that are disabled in this channel.
     */
    disabledCommands: DisabledCommand[];

    /**
     * The event utilities that are disabled in this channel.
     */
    disabledEventUtils: DisabledEventUtil[];
}
