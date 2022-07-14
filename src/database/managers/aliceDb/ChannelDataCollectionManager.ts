import { DatabaseCollectionManager } from "@alice-database/managers/DatabaseCollectionManager";
import { ChannelData } from "@alice-database/utils/aliceDb/ChannelData";
import { DatabaseChannelData } from "structures/database/aliceDb/DatabaseChannelData";
import { Collection as DiscordCollection } from "discord.js";
import { Filter, WithId } from "mongodb";

/**
 * A manager for the `channeldata` collection.
 */
export class ChannelDataCollectionManager extends DatabaseCollectionManager<
    DatabaseChannelData,
    ChannelData
> {
    protected override readonly utilityInstance: new (
        data: DatabaseChannelData
    ) => ChannelData = ChannelData;

    override get defaultDocument(): DatabaseChannelData {
        const date: Date = new Date();

        date.setUTCHours(0, 0, 0, 0);

        return {
            timestamp: date.getTime(),
            channels: [],
        };
    }

    /**
     * Gets channel statistics based on the given range.
     *
     * @param from The minimum time range.
     * @param to The maximum time range.
     * @returns The channel statistics from the given range.
     */
    getFromTimestampRange(
        from: number,
        to: number
    ): Promise<DiscordCollection<number, ChannelData>> {
        const query: Filter<WithId<DatabaseChannelData>> = {
            timestamp: {
                $gte: from,
                $lte: to,
            },
        };

        return this.get("timestamp", query);
    }
}
