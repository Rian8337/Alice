import { DatabaseManager } from "@database/DatabaseManager";
import {
    ApplicationCommandOptionType,
    bold,
    InteractionContextType,
} from "discord.js";
import { CommandCategory } from "@enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { OnButtonPageChange } from "@structures/utils/OnButtonPageChange";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@utils/creators/MessageButtonCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { GuildEmoji } from "discord.js";
import { EmojistatisticsLocalization } from "@localization/interactions/commands/Tools/emojistatistics/EmojistatisticsLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { StringHelper } from "@utils/helpers/StringHelper";
import { DateTimeFormatHelper } from "@utils/helpers/DateTimeFormatHelper";
import { LocaleHelper } from "@utils/helpers/LocaleHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const localization = new EmojistatisticsLocalization(
        CommandHelper.getLocale(interaction),
    );

    await InteractionHelper.deferReply(interaction);

    const stats =
        await DatabaseManager.aliceDb.collections.emojiStatistics.getGuildStatistics(
            interaction.guild,
            { projection: { guildId: 0 } },
        );

    if (!stats) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("serverHasNoData"),
            ),
        });
    }

    const validEmojis: {
        emoji: GuildEmoji;
        count: number;
        averagePerMonth: number;
    }[] = [];

    const currentDate = new Date();

    for (const stat of stats.values()) {
        const actualEmoji = await interaction.guild.emojis
            .fetch(stat.emojiId)
            .catch(() => null);

        if (!actualEmoji) {
            continue;
        }

        const dateCreation = actualEmoji.createdAt;
        const months = Math.max(
            1,
            (currentDate.getUTCFullYear() - dateCreation.getUTCFullYear()) *
                12 +
                currentDate.getUTCMonth() -
                dateCreation.getUTCMonth(),
        );

        validEmojis.push({
            emoji: actualEmoji,
            count: stat.count,
            averagePerMonth: Math.round(stat.count / months),
        });
    }

    if (validEmojis.length === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noValidEmojis"),
            ),
        });
    }

    const sortOption = interaction.options.getString("sortoption") ?? "overall";

    validEmojis.sort((a, b) =>
        sortOption === "overall"
            ? b.count - a.count
            : b.averagePerMonth - a.averagePerMonth,
    );

    const embed = EmbedCreator.createNormalEmbed({
        color: interaction.member.displayColor,
    });

    embed
        .setAuthor({
            name: StringHelper.formatString(
                localization.getTranslation("emojiStatisticsForServer"),
                interaction.guild.name,
            ),
            iconURL: interaction.guild.iconURL()!,
        })
        .setDescription(
            `${bold(
                localization.getTranslation("sortMode"),
            )}: ${localization.getTranslation(
                sortOption === "overall" ? "overall" : "averagePerMonth",
            )}`,
        );

    const BCP47 = LocaleHelper.convertToBCP47(localization.language);

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
                    `${bold(localization.getTranslation("emoji"))}: ${
                        emoji.emoji
                    } \n` +
                    `${bold(
                        localization.getTranslation("dateCreation"),
                    )}: ${DateTimeFormatHelper.dateToLocaleString(
                        emoji.emoji.createdAt,
                        localization.language,
                    )} \n` +
                    `${bold(
                        localization.getTranslation("overallUsage"),
                    )}: ${emoji.count.toLocaleString(BCP47)} \n` +
                    `${bold(
                        localization.getTranslation("averagePerMonthUsage"),
                    )}: ${emoji.averagePerMonth.toLocaleString(BCP47)} `,
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
        onPageChange,
    );
};

export const category: SlashCommand["category"] = CommandCategory.tools;

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
    contexts: [InteractionContextType.Guild],
};
