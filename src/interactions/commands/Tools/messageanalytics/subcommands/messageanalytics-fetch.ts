import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ChannelActivity } from "@alice-database/utils/aliceDb/ChannelActivity";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MessageanalyticsLocalization } from "@alice-localization/interactions/commands/Tools/messageanalytics/MessageanalyticsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { MessageAnalyticsHelper } from "@alice-utils/helpers/MessageAnalyticsHelper";
import { Collection, Guild, GuildTextBasedChannel } from "discord.js";
import consola from "consola";
import { DatabaseChannelActivity } from "@alice-structures/database/aliceDb/DatabaseChannelActivity";

export const run: SlashSubcommand<true>["run"] = async (
    client,
    interaction
) => {
    if (!interaction.inGuild()) {
        return;
    }

    const localization: MessageanalyticsLocalization =
        new MessageanalyticsLocalization(
            await CommandHelper.getLocale(interaction)
        );

    const fromDateEntries: number[] = interaction.options
        .getString("fromdate", true)
        .split("-")
        .map((v) => parseInt(v));

    if (fromDateEntries.length !== 3 || fromDateEntries.some(Number.isNaN)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("incorrectDateFormat")
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
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("incorrectDateFormat")
                ),
            });
        }

        toDate.setUTCFullYear(
            toDateEntries[0],
            toDateEntries[1] - 1,
            toDateEntries[2]
        );
    }

    const guild: Guild = await client.guilds.fetch(Constants.mainServer);
    const channelsToFetch: GuildTextBasedChannel[] = [];

    if ((interaction.options.getString("scope") ?? "channel") === "channel") {
        if (interaction.guildId !== guild.id) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("wrongServer")
                ),
            });
        }

        if (!interaction.channel?.isTextBased()) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("notATextChannel")
                ),
            });
        }

        if (MessageAnalyticsHelper.isChannelFiltered(interaction.channel)) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("channelIsFiltered")
                ),
            });
        }

        channelsToFetch.push(interaction.channel);
    } else {
        for (const channel of guild.channels.cache.values()) {
            if (channel.isTextBased()) {
                channelsToFetch.push(channel);
            }
        }
    }

    await InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("messageFetchStarted")
        ),
    });

    const guildMessageAnalyticsData: Collection<number, ChannelActivity> =
        await DatabaseManager.aliceDb.collections.channelActivity.getFromTimestampRange(
            fromDate.getTime(),
            toDate.getTime()
        );

    for (const channel of channelsToFetch) {
        if (MessageAnalyticsHelper.isChannelFiltered(channel)) {
            continue;
        }

        consola.info(`Fetching messages in #${channel.name}`);

        const messageData: Collection<number, DatabaseChannelActivity> =
            await MessageAnalyticsHelper.getChannelActivity(
                channel,
                fromDate.getTime(),
                toDate.getTime()
            );

        consola.info(
            `Channel #${channel.name} has ${messageData.reduce(
                (a, v) => a + v.messageCount,
                0
            )} messages and ${messageData.reduce(
                (a, v) => a + v.wordsCount,
                0
            )} words`
        );

        for (const [date, activity] of messageData) {
            const channelData: ChannelActivity =
                guildMessageAnalyticsData.get(date) ??
                DatabaseManager.aliceDb.collections.channelActivity
                    .defaultInstance;

            channelData.channelId = channel.id;
            channelData.timestamp = date;
            channelData.messageCount += activity.messageCount;
            channelData.wordsCount += activity.wordsCount;

            guildMessageAnalyticsData.set(date, channelData);

            await DatabaseManager.aliceDb.collections.channelActivity.updateOne(
                { timestamp: date, channelId: channel.id },
                {
                    $set: {
                        messageCount: channelData.messageCount,
                        wordsCount: channelData.wordsCount,
                    },
                },
                { upsert: true }
            );
        }
    }

    interaction.channel!.send({
        content: MessageCreator.createAccept(
            localization.getTranslation("messageFetchDone"),
            interaction.user.toString()
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["BotOwner"],
};
