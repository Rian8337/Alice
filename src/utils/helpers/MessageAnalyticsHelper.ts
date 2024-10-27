import wordsCount from "words-count";
import { Constants } from "@core/Constants";
import { DatabaseManager } from "@database/DatabaseManager";
import { Manager } from "@utils/base/Manager";
import {
    Collection,
    FetchedThreads,
    Guild,
    GuildChannel,
    GuildTextBasedChannel,
    Message,
    MessageManager,
    Snowflake,
    TextChannel,
    ThreadChannel,
} from "discord.js";
import { HelperFunctions } from "./HelperFunctions";
import { ChannelActivityData } from "@structures/utils/ChannelActivityData";

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
        "836625830142017557",
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
        "652902812354609162",
        "1006369245577347082",
        "988135588060364931",
        "350668556624723968",
    ];

    /**
     * Fetches messages on a daily basis.
     *
     * Run each time daily counter is reset.
     *
     * @param newDailyTime The new daily time, in milliseconds.
     */
    static async fetchDaily(newDailyTime: number): Promise<void> {
        const guild: Guild = await this.client.guilds.fetch(
            Constants.mainServer,
        );
        const previousDay: number = newDailyTime - 86400 * 1000;
        const channelData: Collection<Snowflake, ChannelActivityData> =
            new Collection();

        for (const channel of guild.channels.cache.values()) {
            if (this.isChannelFiltered(channel)) {
                continue;
            }

            if (!channel.isTextBased()) {
                continue;
            }

            const finalActivity: Collection<number, ChannelActivityData> =
                await this.getChannelActivity(
                    channel,
                    previousDay,
                    newDailyTime,
                );

            const existingData: ChannelActivityData = channelData.get(
                channel.id,
            ) ?? {
                channelId: channel.id,
                messageCount: 0,
                wordsCount: 0,
            };

            if (existingData) {
                for (const activity of finalActivity.values()) {
                    existingData.messageCount += activity.messageCount;
                    existingData.wordsCount += activity.wordsCount;
                }
            }

            channelData.set(channel.id, existingData);
        }

        await DatabaseManager.aliceDb.collections.channelActivity.updateOne(
            { timestamp: previousDay },
            {
                $set: {
                    channels: [...channelData.values()],
                },
            },
            { upsert: true },
        );
    }

    /**
     * Gets the amount of messages sent by users in a channel within
     * the specified period of time, counting in threads in the channel.
     *
     * @param channel The channel.
     * @param fetchStartTime The time at which messages will start being counted, in milliseconds.
     * @param fetchEndTime The time at which messages will stop being counted, in milliseconds.
     * @returns A collection of channel activity data for each day, mapped by the epoch time of the day, in milliseconds.
     */
    static async getChannelActivity(
        channel: GuildTextBasedChannel,
        fetchStartTime: number,
        fetchEndTime: number,
    ): Promise<Collection<number, ChannelActivityData>> {
        const finalCollection: Collection<number, ChannelActivityData> =
            new Collection();

        const channelCollection: Collection<number, ChannelActivityData> =
            await this.fetchChannelActivity(
                channel,
                fetchStartTime,
                fetchEndTime,
            );

        for (const [date, data] of channelCollection) {
            finalCollection.set(date, data);
        }

        if (channel instanceof TextChannel) {
            const fetchThreadActivity = async (
                fetchedThreads: FetchedThreads,
            ) => {
                for (const thread of fetchedThreads.threads.values()) {
                    const threadCollection: Collection<
                        number,
                        ChannelActivityData
                    > = await this.fetchChannelActivity(
                        thread,
                        fetchStartTime,
                        fetchEndTime,
                    );

                    for (const [date, threadData] of threadCollection) {
                        const data: ChannelActivityData = finalCollection.get(
                            date,
                        ) ?? {
                            channelId: channel.id,
                            messageCount: 0,
                            wordsCount: 0,
                        };

                        data.messageCount += threadData.messageCount;
                        data.wordsCount += threadData.wordsCount;

                        finalCollection.set(date, data);
                    }
                }
            };

            // Count threads for text channels.
            await fetchThreadActivity(await channel.threads.fetchActive());
            await fetchThreadActivity(
                await channel.threads.fetchArchived({ fetchAll: true }),
            );
        }

        return finalCollection;
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

    /**
     * Gets the channel activity of a channel within the specified period of time.
     *
     * IMPORTANT: The bot will start searching from the most recent message instead of
     * from the specified time, therefore this operation is quite expensive. Make sure that
     * you don't specify the time limit to be too far unless you really need it.
     *
     * @param channel The channel.
     * @param fetchStartTime The time at which user messages will start being counted, in milliseconds.
     * @param fetchEndTime The time at which user messages will stop being counted, in milliseconds.
     * @returns A collection of channel activity data for each day, mapped by the epoch time of the day, in milliseconds.
     */
    private static async fetchChannelActivity(
        channel: GuildTextBasedChannel,
        fetchStartTime: number,
        fetchEndTime: number,
    ): Promise<Collection<number, ChannelActivityData>> {
        const collection: Collection<number, ChannelActivityData> =
            new Collection();

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

        const currentDate: Date = new Date(fetchEndTime);
        currentDate.setUTCHours(0, 0, 0, 0);

        let channelActivityData: ChannelActivityData = {
            channelId: channel.id,
            messageCount: 0,
            wordsCount: 0,
        };

        while (currentDate.getTime() >= fetchStartTime && lastMessageID) {
            const messages: Collection<string, Message> | null =
                await messageManager
                    .fetch({
                        limit: fetchCount,
                        before: lastMessageID,
                    })
                    .catch(() => null);

            if (!messages) {
                continue;
            }

            await HelperFunctions.sleep(0.1);

            for (const message of messages.values()) {
                if (message.createdTimestamp > fetchEndTime) {
                    continue;
                }

                if (message.createdTimestamp < currentDate.getTime()) {
                    // The day is over, save current data.
                    collection.set(currentDate.getTime(), channelActivityData);
                    currentDate.setUTCDate(currentDate.getUTCDate() - 1);

                    channelActivityData = {
                        channelId: channel.id,
                        messageCount: 0,
                        wordsCount: 0,
                    };
                }

                if (message.createdTimestamp < fetchStartTime) {
                    break;
                }

                if (!message.author.bot) {
                    ++channelActivityData.messageCount;
                    channelActivityData.wordsCount += wordsCount(
                        message.content,
                    );
                }
            }

            lastMessageID = messages.last()?.id;

            collection.set(currentDate.getTime(), channelActivityData);
        }

        return collection;
    }
}
