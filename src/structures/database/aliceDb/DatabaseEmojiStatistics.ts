import { Snowflake } from "discord.js";
import { EmojiStat } from "structures/moderation/EmojiStat";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents a guild's emoji statistics.
 */
export interface DatabaseEmojiStatistics extends BaseDocument {
    /**
     * The ID of the guild.
     */
    guildID: Snowflake;

    /**
     * Statistics for each guild-specific emoji in the guild.
     */
    emojiStats: EmojiStat[];
}
