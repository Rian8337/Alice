import { Bot } from "@alice-core/Bot";
import { DatabaseCollectionManager } from "@alice-database/managers/DatabaseCollectionManager";
import { EmojiStatistics } from "@alice-database/utils/aliceDb/EmojiStatistics";
import { DatabaseEmojiStatistics } from "@alice-interfaces/database/aliceDb/DatabaseEmojiStatistics";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Snowflake } from "discord.js";
import { Collection as MongoDBCollection } from "mongodb";

/**
 * A manager for the `emojistatistics` collection.
 */
export class EmojiStatisticsCollectionManager extends DatabaseCollectionManager<DatabaseEmojiStatistics, EmojiStatistics> {
    protected readonly utilityInstance: DatabaseUtilityConstructor<DatabaseEmojiStatistics, EmojiStatistics>;

    get defaultDocument(): DatabaseEmojiStatistics {
        return {
            emojiStats: [],
            guildID: ""
        };
    }

    constructor(client: Bot, collection: MongoDBCollection<DatabaseEmojiStatistics>) {
        super(
            client,
            collection
        );

        this.utilityInstance = <DatabaseUtilityConstructor<DatabaseEmojiStatistics, EmojiStatistics>> new EmojiStatistics(client, this.defaultDocument).constructor
    }

    /**
     * Gets the emoji statistics of a guild.
     * 
     * @param guildId The ID of the guild.
     */
    getGuildStatistics(guildId: Snowflake): Promise<EmojiStatistics | null> {
        return this.getOne({ guildID: guildId });
    }
}