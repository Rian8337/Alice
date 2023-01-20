import { DatabaseCollectionManager } from "@alice-database/managers/DatabaseCollectionManager";
import { ChannelActivity } from "@alice-database/utils/aliceDb/ChannelActivity";
import { DatabaseChannelActivity } from "@alice-structures/database/aliceDb/DatabaseChannelActivity";
import { Collection as DiscordCollection } from "discord.js";

/**
 * A manager for the `channelactivity` collection.
 */
export class ChannelActivityCollectionManager extends DatabaseCollectionManager<
    DatabaseChannelActivity,
    ChannelActivity
> {
    protected override readonly utilityInstance: new (
        data: DatabaseChannelActivity
    ) => ChannelActivity = ChannelActivity;

    override get defaultDocument(): DatabaseChannelActivity {
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
    ): Promise<DiscordCollection<number, ChannelActivity>> {
        return this.get("timestamp", {
            timestamp: {
                $gte: from,
                $lte: to,
            },
        });
    }
}
