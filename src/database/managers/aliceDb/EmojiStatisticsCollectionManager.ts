import { DatabaseCollectionManager } from "@alice-database/managers/DatabaseCollectionManager";
import { EmojiStatistics } from "@alice-database/utils/aliceDb/EmojiStatistics";
import { DatabaseEmojiStatistics } from "@alice-interfaces/database/aliceDb/DatabaseEmojiStatistics";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Guild, Snowflake } from "discord.js";
import { Collection as MongoDBCollection } from "mongodb";

/**
 * A manager for the `emojistatistics` collection.
 */
export class EmojiStatisticsCollectionManager extends DatabaseCollectionManager<
    DatabaseEmojiStatistics,
    EmojiStatistics
> {
    protected override readonly utilityInstance: DatabaseUtilityConstructor<
        DatabaseEmojiStatistics,
        EmojiStatistics
    >;

    override get defaultDocument(): DatabaseEmojiStatistics {
        return {
            emojiStats: [],
            guildID: "",
        };
    }

    /**
     * @param collection The MongoDB collection.
     */
    constructor(collection: MongoDBCollection<DatabaseEmojiStatistics>) {
        super(collection);

        this.utilityInstance = <
            DatabaseUtilityConstructor<DatabaseEmojiStatistics, EmojiStatistics>
        >new EmojiStatistics().constructor;
    }

    /**
     * Gets the emoji statistics of a guild.
     *
     * @param guild The guild.
     */
    getGuildStatistics(guild: Guild): Promise<EmojiStatistics | null>;

    /**
     * Gets the emoji statistics of a guild.
     *
     * @param guildId The ID of the guild.
     */
    getGuildStatistics(guildId: Snowflake): Promise<EmojiStatistics | null>;

    /**
     * Gets the emoji statistics of a guild.
     *
     * @param guildId The ID of the guild.
     */
    getGuildStatistics(
        guildOrId: Guild | Snowflake
    ): Promise<EmojiStatistics | null> {
        return this.getOne({
            guildID: guildOrId instanceof Guild ? guildOrId.id : guildOrId,
        });
    }
}
