import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseChannelActivity } from "@alice-structures/database/aliceDb/DatabaseChannelActivity";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";
import { Snowflake } from "discord.js";

/**
 * Represents a channel's activity in a day.
 */
export class ChannelActivity
    extends Manager
    implements DatabaseChannelActivity
{
    channelId: Snowflake;
    timestamp: number;
    messageCount: number;
    wordsCount: number;
    readonly _id?: ObjectId;

    constructor(
        data: DatabaseChannelActivity = DatabaseManager.aliceDb?.collections
            .channelActivity.defaultDocument ?? {}
    ) {
        super();

        this._id = data._id;
        this.channelId = data.channelId;
        this.timestamp = data.timestamp;
        this.messageCount = data.messageCount;
        this.wordsCount = data.wordsCount;
    }
}
