import {
    Collection,
    Guild,
    GuildChannel,
    MessageEmbed,
    Snowflake,
} from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ActivityCategory } from "@alice-interfaces/commands/Tools/ActivityCategory";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { Constants } from "@alice-core/Constants";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { ChannelData } from "@alice-database/utils/aliceDb/ChannelData";
import { ChannelDataCollectionManager } from "@alice-database/managers/aliceDb/ChannelDataCollectionManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import {
    MessageanalyticsLocalization,
    MessageanalyticsStrings,
} from "@alice-localization/commands/Tools/messageanalytics/MessageanalyticsLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";

/**
 * Converts days to milliseconds.
 *
 * @param days The days to convert.
 * @returns The days converted in milliseconds.
 */
function daysToMilliseconds(days: number): number {
    return 24 * 3.6e6 * days;
}

export const run: Subcommand["run"] = async (client, interaction) => {
    const localization: MessageanalyticsLocalization =
        new MessageanalyticsLocalization(
            await CommandHelper.getLocale(interaction)
        );

    const guild: Guild = await client.guilds.fetch(Constants.mainServer);
    const dbManager: ChannelDataCollectionManager =
        DatabaseManager.aliceDb.collections.channelData;

    const date: Date = new Date();

    if (interaction.options.getString("date")) {
        const dateEntries: number[] = interaction.options
            .getString("date", true)
            .split("-")
            .map((v) => parseInt(v));

        if (dateEntries.length !== 3 || dateEntries.some(Number.isNaN)) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    localization.getTranslation("incorrectDateFormat")
                ),
            });
        }

        date.setUTCFullYear(dateEntries[0], dateEntries[1] - 1, dateEntries[2]);
    }

    date.setUTCHours(0, 0, 0, 0);

    if (date.getTime() < guild.createdTimestamp) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("dateBeforeGuildCreationError")
            ),
        });
    }

    if (date.getTime() > Date.now()) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("dateHasntPassed")
            ),
        });
    }

    const droidParent: Snowflake = "360715107220717568";
    const generalParent: Snowflake = "360714965814083586";
    const clansParent: Snowflake = "696646649128288346";
    const languageParent: Snowflake = "440045164422103050";

    let activityData: Collection<number, ChannelData>;

    const type: string = interaction.options.getString("type") ?? "overall";

    switch (type) {
        case "weekly":
            activityData = await dbManager.getFromTimestampRange(
                date.getTime() - daysToMilliseconds(date.getUTCDay()),
                date.getTime() + daysToMilliseconds(6 - date.getUTCDay())
            );

            break;
        case "monthly":
            date.setUTCDate(1);

            activityData = await dbManager.getFromTimestampRange(
                date.getTime(),
                date.getTime() + daysToMilliseconds(30)
            );

            break;
        case "daily":
            date.setUTCDate(date.getUTCDate() - 1);

            activityData = await dbManager.getFromTimestampRange(
                date.getTime(),
                date.getTime() + daysToMilliseconds(1)
            );

            break;
        default:
            activityData = await dbManager.getFromTimestampRange(
                0,
                date.getTime()
            );
    }

    if (activityData.size === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("noActivityDataOnDate")
            ),
        });
    }

    const sortedChannelData: Collection<Snowflake, number> = new Collection();

    // Map to each channel
    for (const data of activityData.values()) {
        for (const [channelId, count] of data.channels) {
            sortedChannelData.set(
                channelId,
                (sortedChannelData.get(channelId) ?? 0) + count
            );
        }
    }

    sortedChannelData.sort((a, b) => {
        return b - a;
    });

    let generalDescription: string = "";
    let clansDescription: string = "";
    let languageDescription: string = "";

    for (const [id, count] of sortedChannelData) {
        const channel: GuildChannel | null = await guild.channels
            .fetch(id)
            .catch(() => null);

        if (!channel) {
            continue;
        }

        const msg: string = `${channel}: ${count.toLocaleString(
            LocaleHelper.convertToBCP47(localization.language)
        )} ${localization.getTranslation("messageCount")}\n`;

        if (
            [generalParent, droidParent].includes(<Snowflake>channel.parentId)
        ) {
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

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: "#b58d3c",
    });

    embed.setTitle(
        `${localization.getTranslation(
            <keyof MessageanalyticsStrings>type || "overall"
        )} ${StringHelper.formatString(
            localization.getTranslation("channelActivity"),
            DateTimeFormatHelper.dateToHumanReadable(date)
        )}`
    );

    const onPageChange: OnButtonPageChange = async (
        _,
        page,
        contents: ActivityCategory[]
    ) => {
        const content: ActivityCategory = contents[page - 1];

        embed.setDescription(`**${content.category}**\n` + content.description);
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        activityCategories,
        1,
        1,
        10,
        onPageChange
    );
};

export const config: Subcommand["config"] = {
    permissions: [],
};
