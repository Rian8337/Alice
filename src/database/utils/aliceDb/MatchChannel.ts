import { Bot } from "@alice-core/Bot";
import { DatabaseMatchChannel } from "@alice-interfaces/database/aliceDb/DatabaseMatchChannel";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";
import { Snowflake } from "discord.js";

/**
 * Represents a binded match channel for a tournament match.
 */
export class MatchChannel extends Manager implements DatabaseMatchChannel {
    channelid: Snowflake;
    matchid: string;
    readonly _id?: ObjectId;

    constructor(client: Bot, data: DatabaseMatchChannel) {
        super(client);

        this._id = data._id;
        this.matchid = data.matchid;
        this.channelid = data.channelid;
    }
}