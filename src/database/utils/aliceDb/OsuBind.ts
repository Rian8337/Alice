import { Bot } from "@alice-core/Bot";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseOsuBind } from "@alice-interfaces/database/aliceDb/DatabaseOsuBind";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";
import { Snowflake } from "discord.js";

/**
 * Represents a Discord user who has an osu! account binded.
 */
export class OsuBind extends Manager implements DatabaseOsuBind {
    discordid: Snowflake;
    username: string;
    readonly _id?: ObjectId;

    constructor(client: Bot, data: DatabaseOsuBind = DatabaseManager.aliceDb.collections.osuBind.defaultDocument) {
        super(client);

        this._id = data._id;
        this.discordid = data.discordid;
        this.username = data.username;
    }
}