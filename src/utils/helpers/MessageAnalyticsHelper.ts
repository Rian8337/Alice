import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Manager } from "@alice-utils/base/Manager";
import {
    Collection,
    FetchedThreads,
    Guild,
    GuildChannel,
    Message,
    MessageManager,
    Snowflake,
    TextChannel,
    ThreadChannel,
} from "discord.js";
import { HelperFunctions } from "./HelperFunctions";

/**
 * A helper for the bot's message analytics.
 */
export abstract class MessageAnalyticsHelper extends Manager {
    /**
     * The IDs of channel categories that are ignored.
     */
    static readonly filteredCategories: Snowflake[] = [
        "894382622787137596",
        "360714803691388928",
        "415559968062963712",
        "360715303149240321",
        "360715871187894273",
        "360715992621514752",
    ];

    /**
     * The IDs of channels that are ignored.
     */
    static readonly filteredChannels: Snowflake[] = [
        "326152555392532481",
        "361785436982476800",
        "316863464888991745",
        "549109230284701718",
        "468042874202750976",
        "430002296160649229",
        "430939277720027136",
        "757137265351721001",
        "757135236659413033",
        "757136393142010027",
        "757137031162888223",
        "757137127652982846",
        "696663321633357844",
        "803160572345712640",
    ];

    /**
     * Fetches messages on a daily basis.
     *
     * Run each time daily counter is reset.
     *
     * @param client The instance of the bot.
     * @param newDailyTime The new daily time, in milliseconds.
     */
    static async fetchDaily(newDailyTime: number): Promise<void> {
        const guild: Guild = await this.client.guilds.fetch(
            Constants.mainServer
        );

        const channelData: Collection<Snowflake, number> = new Collection();

        for await (const channel of guild.channels.cache.values()) {
            if (this.isChannelFiltered(channel)) {
                continue;
            }

            if (!(channel instanceof TextChannel)) {
                continue;
            }

            const finalCounts: Collection<number, number> =
                await this.getChannelMessageCount(
                    channel,
                    newDailyTime - 86400 * 1000,
                    newDailyTime
                );

            channelData.set(
                channel.id,
                finalCounts.reduce((a, v) => a + v, 0)
            );
        }

        await DatabaseManager.aliceDb.collections.channelData.update(
            { timestamp: newDailyTime - 86400 * 1000 },
            {
                $set: {
                    channels: channelData.map((value, key) => [key, value]),
                },
            },
            { upsert: true }
        );
    }

    /**
     * Gets the amount of messages sent by users in a channel within
     * the specified period of time, counting in threads in the channel.
     *
     * @param channel The channel.
     * @param fetchStartTime The time at which messages will start being counted, in milliseconds.
     * @param fetchEndTime The time at which messages will stop being counted, in milliseconds.
     * @returns A collection of amount of messages per day, mapped by the epoch time of the day, in milliseconds.
     */
    static async getChannelMessageCount(
        channel: TextChannel,
        fetchStartTime: number,
        fetchEndTime: number
    ): Promise<Collection<number, number>> {
        const finalCollection: Collection<number, number> = new Collection();

        const channelCollection: Collection<number, number> =
            await this.getUserMessagesCount(
                channel,
                fetchStartTime,
                fetchEndTime
            );

        for (const [date, amount] of channelCollection.entries()) {
            finalCollection.set(date, amount);
        }

        const activeThreads: FetchedThreads =
            await channel.threads.fetchActive();

        for await (const activeThread of activeThreads.threads.values()) {
            const threadCollection: Collection<number, number> =
                await this.getUserMessagesCount(
                    activeThread,
                    fetchStartTime,
                    fetchEndTime
                );

            for (const [date, amount] of threadCollection) {
                finalCollection.set(
                    date,
                    (finalCollection.get(date) ?? 0) + amount
                );
            }
        }

        const archivedThreads: FetchedThreads =
            await channel.threads.fetchArchived({ fetchAll: true });

        for await (const archivedThread of archivedThreads.threads.values()) {
            const threadCollection: Collection<number, number> =
                await this.getUserMessagesCount(
                    archivedThread,
                    fetchStartTime,
                    fetchEndTime
                );

            for (const [date, amount] of threadCollection) {
                finalCollection.set(
                    date,
                    (finalCollection.get(date) ?? 0) + amount
                );
            }
        }

        return finalCollection;
    }

    /**
     * Gets the amount of messages sent by users in a channel within the specified period of time.
     *
     * IMPORTANT: The bot will start searching from the most recent message instead of
     * from the specified time, therefore this operation is quite expensive. Make sure that
     * you don't specify the time limit to be too far unless you really need it.
     *
     * @param channel The channel.
     * @param fetchStartTime The time at which user messages will start being counted, in milliseconds.
     * @param fetchEndTime The time at which user messages will stop being counted, in milliseconds.
     * @returns The amount of messages sent by users in the channel.
     */
    private static async getUserMessagesCount(
        channel: TextChannel | ThreadChannel,
        fetchStartTime: number,
        fetchEndTime: number
    ): Promise<Collection<number, number>> {
        const collection: Collection<number, number> = new Collection();

        if (this.isChannelFiltered(channel)) {
            return collection;
        }

        const fetchCount: number = 100;

        const messageManager: MessageManager = channel.messages;

        const lastMessage: Message | undefined = (
            await messageManager.fetch({ limit: 1 })
        ).first();

        let lastMessageID: Snowflake | undefined = lastMessage?.id;

        if (!lastMessageID) {
            return collection;
        }

        let validCount: number = 0;

        const currentDate: Date = new Date(fetchEndTime);

        currentDate.setUTCHours(0, 0, 0, 0);

        while (currentDate.getTime() >= fetchStartTime && lastMessageID) {
            const messages: Collection<string, Message> =
                await messageManager.fetch({
                    limit: fetchCount,
                    before: lastMessageID,
                });

            await HelperFunctions.sleep(0.2);

            for (const message of messages.values()) {
                if (message.createdTimestamp > fetchEndTime) {
                    continue;
                }

                if (message.createdTimestamp < currentDate.getTime()) {
                    collection.set(currentDate.getTime(), validCount);

                    currentDate.setUTCDate(currentDate.getUTCDate() - 1);

                    validCount = 0;
                }

                if (message.createdTimestamp < fetchStartTime) {
                    break;
                }

                if (!message.author.bot) {
                    ++validCount;
                }
            }

            lastMessageID = messages.last()?.id;

            collection.set(currentDate.getTime(), validCount);
        }

        return collection;
    }

    /**
     * Checks whether a channel is filtered.
     *
     * @param channel The channel to check.
     * @returns Whether the channel is filtered.
     */
    static isChannelFiltered(channel: GuildChannel | ThreadChannel): boolean {
        return (
            this.filteredCategories.includes(<Snowflake>channel.parentId) ||
            this.filteredChannels.includes(channel.id)
        );
    }
}
