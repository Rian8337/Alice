import { Collection, Guild, GuildChannel, MessageEmbed, Snowflake } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { ActivityCategory } from "@alice-interfaces/commands/Tools/ActivityCategory";
import { Command } from "@alice-interfaces/core/Command";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { Constants } from "@alice-core/Constants";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { activityinfoStrings } from "./activityinfoStrings";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { ChannelData } from "@alice-database/utils/aliceDb/ChannelData";
import { ChannelDataCollectionManager } from "@alice-database/managers/aliceDb/ChannelDataCollectionManager";

/**
 * Converts days to milliseconds.
 * 
 * @param days The days to convert.
 * @returns The days converted in milliseconds.
 */
function daysToMilliseconds(days: number): number {
    return 24 * 3.6e6 * days;
}

export const run: Command["run"] = async (client, interaction) => {
    const guild: Guild = await client.guilds.fetch(Constants.mainServer);
    const dbManager: ChannelDataCollectionManager = DatabaseManager.aliceDb.collections.channelData;

    const date: Date = new Date();

    if (interaction.options.getString("date")) {
        const dateEntries: number[] = (interaction.options.getString("date", true)).split("-").map(v => parseInt(v));

        if (dateEntries.length !== 3 || dateEntries.some(isNaN)) {
            return interaction.editReply({
                content: MessageCreator.createReject(activityinfoStrings.incorrectDateFormat)
            });
        }

        date.setUTCFullYear(dateEntries[0], dateEntries[1] - 1, dateEntries[2] - 1);
    }

    date.setUTCHours(0, 0, 0, 0);

    if (date.getTime() < guild.createdTimestamp) {
        return interaction.editReply({
            content: MessageCreator.createReject(activityinfoStrings.dateBeforeGuildCreationError)
        });
    }

    if (date.getTime() > Date.now()) {
        return interaction.editReply({
            content: MessageCreator.createReject(activityinfoStrings.dateHasntPassed)
        });
    }

    const droidParent: Snowflake = "360715107220717568";
    const generalParent: Snowflake = "360714965814083586";
    const clansParent: Snowflake = "696646649128288346";
    const languageParent: Snowflake = "440045164422103050";

    let activityData: Collection<number, ChannelData>;

    switch (interaction.options.getString("type")) {
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
        default:
            date.setUTCDate(date.getUTCDate() - 1);

            activityData = await dbManager.getFromTimestampRange(
                date.getTime(),
                date.getTime() + daysToMilliseconds(1)
            );

            break;
    }

    if (activityData.size === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(activityinfoStrings.noActivityDataOnDate)
        });
    }

    const sortedChannelData: Collection<Snowflake, number> = new Collection();

    // Map to each channel
    for (const data of activityData.values()) {
        for (const [channelId, count] of data.channels) {
            sortedChannelData.set(channelId, (sortedChannelData.get(channelId) ?? 0) + count);
        }
    }

    sortedChannelData.sort((a, b) => {
        return b - a;
    });

    let generalDescription: string = "";
    let clansDescription: string = "";
    let languageDescription: string = "";

    for await (const [id, count] of sortedChannelData) {
        const channel: GuildChannel | null = await guild.channels.fetch(id);

        if (!channel) {
            continue;
        }

        const msg: string = `${channel}: ${count.toLocaleString()} messages\n`;

        if ([generalParent, droidParent].includes(<Snowflake> channel.parentId)) {
            generalDescription += msg;
        } else if (channel.parentId === clansParent) {
            clansDescription += msg;
        } else if (channel.parentId === languageParent) {
            languageDescription += msg;
        }
    }

    const activityCategories: ActivityCategory[] = [
        {
            category: "General Channels",
            description: generalDescription
        },
        {
            category: "Language Channels",
            description: languageDescription
        },
        {
            category: "Clan Channels",
            description: clansDescription
        }
    ];

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed(
        { author: interaction.user, color: "#b58d3c" }
    );

    embed.setTitle(`${StringHelper.capitalizeString(<string> interaction.options.getString("type"))} channel activity per ${DateTimeFormatHelper.dateToHumanReadable(date)}`);

    const onPageChange: OnButtonPageChange = async (options, page, contents: ActivityCategory[]) => {
        const content: ActivityCategory = contents[page - 1];

        const embed: MessageEmbed = <MessageEmbed> options.embeds![0];

        embed.setDescription(
            `**${content.category}**\n\n` +
            content.description
        );

        options.embeds![0] = embed;
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

export const category: Command["category"] = CommandCategory.TOOLS;

export const config: Command["config"] = {
    name: "activityinfo",
    description: "Views channel activities in main server.",
    options: [
        {
            name: "type",
            type: CommandArgumentType.STRING,
            description: "The activity interval type to view.",
            choices: [
                {
                    name: "Overall",
                    value: "overall"
                },
                {
                    name: "Monthly",
                    value: "monthly"
                },
                {
                    name: "Weekly",
                    value: "weekly"
                },
                {
                    name: "Daily",
                    value: "daily"
                }
            ]
        },
        {
            name: "date",
            type: CommandArgumentType.STRING,
            description: "The UTC-based date to view, in <year>-<month>-<date> format. Defaults on the current UTC date, month, and year."
        }
    ],
    example: [
        {
            command: "activityinfo",
            description: "will view activity information of the main server based on."
        },
        {
            command: "activityinfo 2021-5-4",
            description: "will view activity information of the main server at the week May 4, 2021 is at."
        }
    ],
    permissions: [],
    scope: "ALL"
};