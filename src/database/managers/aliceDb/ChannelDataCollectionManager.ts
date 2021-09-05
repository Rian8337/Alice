import { DatabaseCollectionManager } from "@alice-database/managers/DatabaseCollectionManager";
import { ChannelData } from "@alice-database/utils/aliceDb/ChannelData";
import { DatabaseChannelData } from "@alice-interfaces/database/aliceDb/DatabaseChannelData";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Collection as DiscordCollection } from "discord.js";
import { Collection as MongoDBCollection, FilterQuery } from "mongodb";

/**
 * A manager for the `channeldata` collection.
 */
export class ChannelDataCollectionManager extends DatabaseCollectionManager<DatabaseChannelData, ChannelData> {
    protected readonly utilityInstance: DatabaseUtilityConstructor<DatabaseChannelData, ChannelData>;

    get defaultDocument(): DatabaseChannelData {
        const date: Date = new Date();

        date.setUTCHours(0);

        return {
            timestamp: date.getTime(),
            channels: []
        };
    }

    /**
     * @param collection The MongoDB collection.
     */
    constructor(collection: MongoDBCollection<DatabaseChannelData>) {
        super(collection);

        this.utilityInstance = <DatabaseUtilityConstructor<DatabaseChannelData, ChannelData>> new ChannelData().constructor
    }

    /**
     * Gets channel statistics based on the given range.
     * 
     * @param from The minimum time range.
     * @param to The maximum time range.
     * @param inclusive Whether the specified time range is inclusive.
     * @returns The channel statistics from the given range.
     */
    getFromTimestampRange(from: number, to: number, inclusive: boolean = true): Promise<DiscordCollection<number, ChannelData>> {
        const query: FilterQuery<DatabaseChannelData> = {
            timestamp: inclusive ?
                {
                    $gte: from,
                    $lte: to
                } :
                {
                    $gt: from,
                    $lt: to
                }
        };

        return this.get("timestamp", query);
    }
}