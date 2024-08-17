import { Snowflake } from "discord.js";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents a guild's emoji statistics.
 */
export interface DatabaseEmojiStatistics extends BaseDocument {
    /**
     * The ID of the guild.
     */
    guildId: Snowflake;

    /**
     * The ID of the emoji.
     */
    emojiId: Snowflake;

    /**
     * The amount of times the emoji has been used.
     */
    count: number;
}
