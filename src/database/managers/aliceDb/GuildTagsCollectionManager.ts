import { DatabaseCollectionManager } from "@alice-database/managers/DatabaseCollectionManager";
import { GuildTags } from "@alice-database/utils/aliceDb/GuildTags";
import { Tag } from "@alice-interfaces/commands/Tools/Tag";
import { DatabaseGuildTags } from "@alice-interfaces/database/aliceDb/DatabaseGuildTags";
import { DatabaseOperationResult } from "@alice-interfaces/database/DatabaseOperationResult";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Collection as DiscordCollection, Snowflake } from "discord.js";
import { Collection as MongoDBCollection } from "mongodb";

/**
 * A manager for the `guildtags` collection.
 */
export class GuildTagsCollectionManager extends DatabaseCollectionManager<DatabaseGuildTags, GuildTags> {
    protected readonly utilityInstance: DatabaseUtilityConstructor<DatabaseGuildTags, GuildTags>;

    get defaultDocument(): DatabaseGuildTags {
        return {
            guildid: "",
            tags: []
        };
    }

    /**
     * @param collection The MongoDB collection.
     */
    constructor(collection: MongoDBCollection<DatabaseGuildTags>) {
        super(collection);

        this.utilityInstance = <DatabaseUtilityConstructor<DatabaseGuildTags, GuildTags>> new GuildTags().constructor
    }

    /**
     * Gets a guild's tags.
     * 
     * @param guildId The ID of the guild.
     * @returns The guild's tags, mapped by their name.
     */
    async getGuildTags(guildId: Snowflake): Promise<DiscordCollection<string, Tag>> {
        const guildTags: GuildTags | null = await this.getOne({ guildid: guildId });

        return guildTags?.tags ?? new DiscordCollection();
    }

    /**
     * Gets a guild's tags that have not been scanned for empty tags.
     * 
     * @returns A guild's tags that have not been scanned, `null` if all tags have been scanned.
     */
    async getUnscannedGuildTags(): Promise<GuildTags | null> {
        return this.getOne({ emptyScanDone: { $ne: true } });
    }

    /**
     * Updates a guild's tags.
     * 
     * @param guildId The ID of the guild.
     * @param tags The tags of the guild.
     */
    updateGuildTags(guildId: Snowflake, tags: DiscordCollection<string, Tag>): Promise<DatabaseOperationResult> {
        return this.update(
            { guildid: guildId },
            {
                $set: {
                    tags: [...tags.values()]
                }
            },
            { upsert: true }
        );
    }
}