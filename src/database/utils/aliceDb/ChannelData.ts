import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseChannelData } from "structures/database/aliceDb/DatabaseChannelData";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";
import { Collection, Snowflake } from "discord.js";

/**
 * Represents data about channel activity in a specific time.
 */
export class ChannelData extends Manager {
    /**
     * The epoch time for the data, in milliseconds.
     */
    timestamp: number;

    /**
     * The data for each channel message activity.
     */
    channels: Collection<Snowflake, number>;

    /**
     * The BSON object ID of this document in the database.
     */
    readonly _id?: ObjectId;

    constructor(
        data: DatabaseChannelData = DatabaseManager.aliceDb?.collections
            .channelData.defaultDocument ?? {}
    ) {
        super();

        this._id = data._id;
        this.timestamp = data.timestamp;
        this.channels = new Collection(data.channels ?? []);
    }
}
