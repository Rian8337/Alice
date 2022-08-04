import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ChannelData } from "@alice-database/utils/aliceDb/ChannelData";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MessageanalyticsLocalization } from "@alice-localization/interactions/commands/Tools/messageanalytics/MessageanalyticsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { MessageAnalyticsHelper } from "@alice-utils/helpers/MessageAnalyticsHelper";
import { Collection, Guild, TextChannel } from "discord.js";
import consola from "consola";

export const run: SlashSubcommand<true>["run"] = async (
    client,
    interaction
) => {
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

    const channelsToFetch: TextChannel[] = [];

    if ((interaction.options.getString("scope") ?? "channel") === "channel") {
        if (interaction.guildId !== guild.id) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("wrongServer")
                ),
            });
        }

        if (!(interaction.channel instanceof TextChannel)) {
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
            if (channel instanceof TextChannel) {
                channelsToFetch.push(channel);
            }
        }
    }

    await InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("messageFetchStarted")
        ),
    });

    const guildMessageAnalyticsData: Collection<number, ChannelData> =
        await DatabaseManager.aliceDb.collections.channelData.getFromTimestampRange(
            fromDate.getTime(),
            toDate.getTime()
        );

    for (const channel of channelsToFetch) {
        if (MessageAnalyticsHelper.isChannelFiltered(channel)) {
            continue;
        }

        consola.info(`Fetching messages in #${channel.name}`);

        const messageData: Collection<number, number> =
            await MessageAnalyticsHelper.getChannelMessageCount(
                channel,
                fromDate.getTime(),
                toDate.getTime()
            );

        consola.info(
            `Channel #${channel.name} has ${messageData.reduce(
                (a, v) => a + v,
                0
            )} messages`
        );

        for (const [date, count] of messageData) {
            const channelData: ChannelData =
                guildMessageAnalyticsData.get(date) ??
                DatabaseManager.aliceDb.collections.channelData.defaultInstance;

            channelData.timestamp = date;

            channelData.channels.set(channel.id, count);

            guildMessageAnalyticsData.set(date, channelData);

            await DatabaseManager.aliceDb.collections.channelData.updateOne(
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
