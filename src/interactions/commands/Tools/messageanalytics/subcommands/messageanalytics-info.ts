import {
    Collection,
    Guild,
    EmbedBuilder,
    Snowflake,
    GuildBasedChannel,
    bold,
} from "discord.js";
import { DatabaseManager } from "@database/DatabaseManager";
import { ActivityCategory } from "structures/interactions/commands/Tools/ActivityCategory";
import { OnButtonPageChange } from "@structures/utils/OnButtonPageChange";
import { Constants } from "@core/Constants";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { MessageButtonCreator } from "@utils/creators/MessageButtonCreator";
import { StringHelper } from "@utils/helpers/StringHelper";
import { DateTimeFormatHelper } from "@utils/helpers/DateTimeFormatHelper";
import { ChannelActivity } from "@database/utils/aliceDb/ChannelActivity";
import { ChannelActivityCollectionManager } from "@database/managers/aliceDb/ChannelDataCollectionManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import {
    MessageanalyticsLocalization,
    MessageanalyticsStrings,
} from "@localization/interactions/commands/Tools/messageanalytics/MessageanalyticsLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { LocaleHelper } from "@utils/helpers/LocaleHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { ChannelActivityData } from "@structures/utils/ChannelActivityData";

/**
 * Converts days to milliseconds.
 *
 * @param days The days to convert.
 * @returns The days converted in milliseconds.
 */
function daysToMilliseconds(days: number): number {
    return 24 * 3.6e6 * days;
}

export const run: SlashSubcommand<true>["run"] = async (
    client,
    interaction,
) => {
    const localization: MessageanalyticsLocalization =
        new MessageanalyticsLocalization(CommandHelper.getLocale(interaction));

    const guild: Guild = await client.guilds.fetch(Constants.mainServer);
    const dbManager: ChannelActivityCollectionManager =
        DatabaseManager.aliceDb.collections.channelActivity;

    const date: Date = new Date();

    if (interaction.options.getString("date")) {
        const dateEntries: number[] = interaction.options
            .getString("date", true)
            .split("-")
            .map((v) => parseInt(v));

        if (dateEntries.length !== 3 || dateEntries.some(Number.isNaN)) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("incorrectDateFormat"),
                ),
            });
        }

        date.setUTCFullYear(dateEntries[0], dateEntries[1] - 1, dateEntries[2]);
    }

    date.setUTCHours(0, 0, 0, 0);

    if (date.getTime() < guild.createdTimestamp) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("dateBeforeGuildCreationError"),
            ),
        });
    }

    if (date.getTime() > Date.now()) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("dateHasntPassed"),
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const droidParent: Snowflake = "360715107220717568";
    const generalParent: Snowflake = "360714965814083586";
    const clansParent: Snowflake = "696646649128288346";
    const languageParent: Snowflake = "440045164422103050";

    let activityData: Collection<number, ChannelActivity>;

    const type: string = interaction.options.getString("type") ?? "overall";

    switch (type) {
        case "weekly":
            activityData = await dbManager.getFromTimestampRange(
                date.getTime() - daysToMilliseconds(date.getUTCDay()),
                date.getTime() + daysToMilliseconds(6 - date.getUTCDay()),
            );

            break;
        case "monthly":
            date.setUTCDate(1);

            activityData = await dbManager.getFromTimestampRange(
                date.getTime(),
                date.getTime() + daysToMilliseconds(30),
            );

            break;
        case "daily":
            date.setUTCDate(date.getUTCDate() - 1);

            activityData = await dbManager.getFromTimestampRange(
                date.getTime(),
                date.getTime() + daysToMilliseconds(1),
            );

            break;
        default:
            activityData = await dbManager.getFromTimestampRange(
                0,
                date.getTime(),
            );
    }

    if (activityData.size === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noActivityDataOnDate"),
            ),
        });
    }

    const sortedChannelData: Collection<Snowflake, ChannelActivityData> =
        new Collection();

    // Map to each channel.
    for (const activity of activityData.values()) {
        for (const data of activity.channels.values()) {
            const existingData: ChannelActivityData =
                sortedChannelData.get(data.channelId) ?? data;

            if (sortedChannelData.has(data.channelId)) {
                existingData.messageCount += data.messageCount;
                existingData.wordsCount += data.wordsCount;
            }

            sortedChannelData.set(data.channelId, existingData);
        }
    }

    // Sort by words count as it is the preferred way to measure activity.
    sortedChannelData.sort((a, b) => b.wordsCount - a.wordsCount);

    let generalDescription: string = "";
    let clansDescription: string = "";
    let languageDescription: string = "";

    for (const [id, data] of sortedChannelData) {
        const channel: GuildBasedChannel | null = await guild.channels
            .fetch(id)
            .catch(() => null);

        if (!channel) {
            continue;
        }

        const BCP47: string = LocaleHelper.convertToBCP47(
            localization.language,
        );
        const msg: string = `${channel}: ${data.messageCount.toLocaleString(
            BCP47,
        )} ${localization.getTranslation(
            "messageCount",
        )}, ${data.wordsCount.toLocaleString(
            BCP47,
        )} ${localization.getTranslation("wordsCount")}\n`;

        if ([generalParent, droidParent].includes(channel.parentId!)) {
            generalDescription += msg;
        } else if (channel.parentId === clansParent) {
            clansDescription += msg;
        } else if (channel.parentId === languageParent) {
            languageDescription += msg;
        }
    }

    const activityCategories: ActivityCategory[] = [
        {
            category: localization.getTranslation("generalChannels"),
            description: generalDescription,
        },
        {
            category: localization.getTranslation("languageChannels"),
            description: languageDescription,
        },
        {
            category: localization.getTranslation("clanChannels"),
            description: clansDescription,
        },
    ];

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: "#b58d3c",
    });

    embed.setTitle(
        `${localization.getTranslation(
            <keyof MessageanalyticsStrings>type || "overall",
        )} ${StringHelper.formatString(
            localization.getTranslation("channelActivity"),
            DateTimeFormatHelper.dateToHumanReadable(date),
        )}`,
    );

    const onPageChange: OnButtonPageChange = async (_, page) => {
        const content: ActivityCategory = activityCategories[page - 1];

        embed.setDescription(
            `${bold(content.category)}\n` + content.description,
        );
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        1,
        activityCategories.length,
        30,
        onPageChange,
    );
};
