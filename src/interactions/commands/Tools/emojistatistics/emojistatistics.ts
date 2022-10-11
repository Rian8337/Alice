import { DatabaseManager } from "@alice-database/DatabaseManager";
import { EmojiStatistics } from "@alice-database/utils/aliceDb/EmojiStatistics";
import { ApplicationCommandOptionType } from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { OnButtonPageChange } from "@alice-structures/utils/OnButtonPageChange";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { GuildEmoji, GuildMember, EmbedBuilder } from "discord.js";
import { EmojistatisticsLocalization } from "@alice-localization/interactions/commands/Tools/emojistatistics/EmojistatisticsLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    const localization: EmojistatisticsLocalization =
        new EmojistatisticsLocalization(
            await CommandHelper.getLocale(interaction)
        );

    const stats: EmojiStatistics | null =
        await DatabaseManager.aliceDb.collections.emojiStatistics.getGuildStatistics(
            interaction.guild!
        );

    if (!stats) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("serverHasNoData")
            ),
        });
    }

    const validEmojis: {
        emoji: GuildEmoji;
        count: number;
        averagePerMonth: number;
    }[] = [];

    const currentDate: Date = new Date();

    for (const emoji of stats.emojiStats.values()) {
        const actualEmoji: GuildEmoji | null = await interaction
            .guild!.emojis.fetch(emoji.id)
            .catch(() => null);

        if (!actualEmoji) {
            continue;
        }

        const dateCreation: Date = actualEmoji.createdAt;
        const months: number = Math.max(
            1,
            (currentDate.getUTCFullYear() - dateCreation.getUTCFullYear()) *
                12 +
                currentDate.getUTCMonth() -
                dateCreation.getUTCMonth()
        );

        validEmojis.push({
            emoji: actualEmoji,
            count: emoji.count,
            averagePerMonth: Math.round(emoji.count / months),
        });
    }

    if (validEmojis.length === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noValidEmojis")
            ),
        });
    }

    const sortOption: string =
        interaction.options.getString("sortoption") ?? "overall";

    validEmojis.sort((a, b) =>
        sortOption === "overall"
            ? b.count - a.count
            : b.averagePerMonth - a.averagePerMonth
    );

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed
        .setAuthor({
            name: StringHelper.formatString(
                localization.getTranslation("emojiStatisticsForServer"),
                interaction.guild!.name
            ),
            iconURL: interaction.guild!.iconURL()!,
        })
        .setDescription(
            `**${localization.getTranslation(
                "sortMode"
            )}**: ${localization.getTranslation(
                sortOption === "overall" ? "overall" : "averagePerMonth"
            )}`
        );

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    const onPageChange: OnButtonPageChange = async (_, page) => {
        for (
            let i = 5 * (page - 1);
            i < Math.min(validEmojis.length, 5 + 5 * (page - 1));
            ++i
        ) {
            const emoji = validEmojis[i];

            embed.addFields({
                name: `${i + 1}.${emoji.emoji.name}`,
                value:
                    `**${localization.getTranslation("emoji")}**: ${
                        emoji.emoji
                    } \n` +
                    `**${localization.getTranslation(
                        "dateCreation"
                    )}**: ${DateTimeFormatHelper.dateToLocaleString(
                        emoji.emoji.createdAt,
                        localization.language
                    )} \n` +
                    `**${localization.getTranslation(
                        "overallUsage"
                    )}**: ${emoji.count.toLocaleString(BCP47)} \n` +
                    `**${localization.getTranslation(
                        "averagePerMonthUsage"
                    )}**: ${emoji.averagePerMonth.toLocaleString(BCP47)} `,
            });
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        1,
        Math.ceil(validEmojis.length / 5),
        120,
        onPageChange
    );
};

export const category: SlashCommand["category"] = CommandCategory.TOOLS;

export const config: SlashCommand["config"] = {
    name: "emojistatistics",
    description: "Views statistics for emoji usage of the server.",
    options: [
        {
            name: "sortoption",
            type: ApplicationCommandOptionType.String,
            description:
                "Whether to sort based on overall or average per month usage. Defaults to overall.",
            choices: [
                {
                    name: "Average per month",
                    value: "average",
                },
                {
                    name: "Overall",
                    value: "overall",
                },
            ],
        },
    ],
    example: [
        {
            command: "emojistatistics",
            arguments: [
                {
                    name: "sortoption",
                    value: "Average per month",
                },
            ],
            description:
                "will show emoji usage statistics in the server sorted by average usage per month.",
        },
    ],
    permissions: [],
    scope: "GUILD_CHANNEL",
};
