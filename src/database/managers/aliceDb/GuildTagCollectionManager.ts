import { DatabaseCollectionManager } from "@alice-database/managers/DatabaseCollectionManager";
import { GuildTag } from "@alice-database/utils/aliceDb/GuildTag";
import { DatabaseGuildTag } from "structures/database/aliceDb/DatabaseGuildTag";
import { Collection as DiscordCollection, Snowflake } from "discord.js";

/**
 * A manager for the `tags` collection.
 */
export class GuildTagCollectionManager extends DatabaseCollectionManager<
    DatabaseGuildTag,
    GuildTag
> {
    protected override readonly utilityInstance: new (
        data: DatabaseGuildTag
    ) => GuildTag = GuildTag;

    override get defaultDocument(): DatabaseGuildTag {
        return {
            attachment_message: "",
            attachments: [],
            author: "",
            content: "",
            date: Date.now(),
            guildid: "",
            name: "",
        };
    }

    /**
     * Gets a guild tag by its name.
     *
     * @param guildId The ID of the guild.
     * @param name The name of the tag.
     * @returns The guild tag, `null` if not found.
     */
    getByName(guildId: Snowflake, name: string): Promise<GuildTag | null> {
        return this.getOne({
            guildid: guildId,
            name: name,
        });
    }

    /**
     * Gets a user's guild tags in a guild.
     *
     * @param guildId The ID of the guild.
     * @param userId The ID of the user.
     * @returns The user's tags in the specified guild, mapped by their name.
     */
    getUserGuildTags(
        guildId: Snowflake,
        userId: Snowflake
    ): Promise<DiscordCollection<string, GuildTag>> {
        return this.get("name", {
            guildid: guildId,
            author: userId,
        });
    }
}
