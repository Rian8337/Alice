import { Snowflake } from "discord.js";
import { DisabledCommand } from "@alice-interfaces/moderation/DisabledCommand";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents a text channel's settings.
 */
export interface DatabaseChannelSettings extends BaseDocument {
    /**
     * The ID of the channel.
     */
    channelID: Snowflake;

    /**
     * The commands that are disabled or given cooldown in the channel.
     */
    disabledCommands: DisabledCommand[];

    /**
     * The utilities that are disabled in this channel.
     */
    disabledUtils: string[];
}