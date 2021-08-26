import { Bot } from "@alice-core/Bot";
import { Tag } from "@alice-interfaces/commands/Tools/Tag";
import { DatabaseGuildTags } from "@alice-interfaces/database/aliceDb/DatabaseGuildTags";
import { Manager } from "@alice-utils/base/Manager";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { ObjectId } from "bson";
import { Collection, Snowflake } from "discord.js";

/**
 * Represents guild-specific tags.
 */
export class GuildTags extends Manager {
    /**
     * The ID of the guild.
     */
    guildid: Snowflake;

    /**
     * The tags that the guild has, mapped by their name.
     */
    tags: Collection<string, Tag>;

    /**
     * The BSON object ID of this document in the database.
     */
    readonly _id?: ObjectId;

    constructor(client: Bot, data: DatabaseGuildTags) {
        super(client);

        this._id = data._id;
        this.guildid = data.guildid;
        this.tags = ArrayHelper.arrayToCollection(data.tags ?? [], "name");
    }
}