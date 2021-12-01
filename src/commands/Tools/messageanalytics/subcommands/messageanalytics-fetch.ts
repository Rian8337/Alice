import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ChannelData } from "@alice-database/utils/aliceDb/ChannelData";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MessageAnalyticsHelper } from "@alice-utils/helpers/MessageAnalyticsHelper";
import { Collection, TextChannel } from "discord.js";
import { messageanalyticsStrings } from "../messageanalyticsStrings";

export const run: Subcommand["run"] = async (client, interaction) => {
    const fromDateEntries: number[] = interaction.options
        .getString("fromdate", true)
        .split("-")
        .map((v) => parseInt(v));

    if (fromDateEntries.length !== 3 || fromDateEntries.some(Number.isNaN)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                messageanalyticsStrings.incorrectDateFormat
            ),
        });
    }

    const fromDate: Date = new Date(
        fromDateEntries[0],
        fromDateEntries[1] - 1,
        fromDateEntries[2],
        0,
        0,
        0,
        0
    );

    const toDate: Date = new Date();

    toDate.setUTCHours(0, 0, 0, 0);

    if (interaction.options.getString("untildate")) {
        const toDateEntries: number[] = interaction.options
            .getString("untildate", true)
            .split("-")
            .map((v) => parseInt(v));

        if (toDateEntries.length !== 3 || toDateEntries.some(Number.isNaN)) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    messageanalyticsStrings.incorrectDateFormat
                ),
            });
        }

        toDate.setUTCFullYear(
            toDateEntries[0],
            toDateEntries[1] - 1,
            toDateEntries[2]
        );
    }

    const channelsToFetch: TextChannel[] = [];

    if ((interaction.options.getString("scope") ?? "channel") === "channel") {
        if (!(interaction.channel instanceof TextChannel)) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    messageanalyticsStrings.notATextChannel
                ),
            });
        }

        if (MessageAnalyticsHelper.isChannelFiltered(interaction.channel)) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    messageanalyticsStrings.channelIsFiltered
                ),
            });
        }

        channelsToFetch.push(interaction.channel);
    } else {
        for (const channel of interaction.guild!.channels.cache.values()) {
            if (channel instanceof TextChannel) {
                channelsToFetch.push(channel);
            }
        }
    }

    await interaction.editReply({
        content: MessageCreator.createAccept(
            messageanalyticsStrings.messageFetchStarted
        ),
    });

    const guildMessageAnalyticsData: Collection<number, ChannelData> =
        await DatabaseManager.aliceDb.collections.channelData.getFromTimestampRange(
            fromDate.getTime(),
            toDate.getTime()
        );

    for await (const channel of channelsToFetch) {
        if (MessageAnalyticsHelper.isChannelFiltered(channel)) {
            continue;
        }

        client.logger.info(`Fetching messages in #${channel.name}`);

        const messageData: Collection<number, number> =
            await MessageAnalyticsHelper.getChannelMessageCount(
                channel,
                fromDate.getTime(),
                toDate.getTime()
            );

        client.logger.info(
            `Channel #${channel.name} has ${messageData.reduce(
                (a, v) => a + v,
                0
            )} messages`
        );

        for await (const [date, count] of messageData) {
            const channelData: ChannelData =
                guildMessageAnalyticsData.get(date) ??
                DatabaseManager.aliceDb.collections.channelData.defaultInstance;

            channelData.timestamp = date;

            channelData.channels.set(
                channel.id,
                (channelData.channels.get(channel.id) ?? 0) + count
            );

            guildMessageAnalyticsData.set(date, channelData);

            await DatabaseManager.aliceDb.collections.channelData.update(
                { timestamp: date },
                {
                    $set: {
                        channels: channelData.channels.map((value, key) => [
                            key,
                            value,
                        ]),
                    },
                },
                { upsert: true }
            );
        }
    }
};

export const config: Subcommand["config"] = {
    permissions: ["BOT_OWNER"],
};
