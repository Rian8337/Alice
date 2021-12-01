import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseEmojiStatistics } from "@alice-interfaces/database/aliceDb/DatabaseEmojiStatistics";
import { EmojiStat } from "@alice-interfaces/moderation/EmojiStat";
import { Manager } from "@alice-utils/base/Manager";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { ObjectId } from "bson";
import { Collection, Snowflake } from "discord.js";

/**
 * Represents a guild's emoji statistics.
 */
export class EmojiStatistics extends Manager {
    /**
     * The ID of the guild.
     */
    guildID: Snowflake;

    /**
     * Statistics for each guild-specific emoji in the guild.
     */
    emojiStats: Collection<Snowflake, EmojiStat>;

    /**
     * The BSON object ID of this document in the database.
     */
    readonly _id?: ObjectId;

    constructor(
        data: DatabaseEmojiStatistics = DatabaseManager.aliceDb?.collections
            .emojiStatistics.defaultDocument ?? {}
    ) {
        super();

        this._id = data._id;
        this.guildID = data.guildID;
        this.emojiStats = ArrayHelper.arrayToCollection(
            data.emojiStats ?? [],
            "id"
        );
    }
}
