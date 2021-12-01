import { DatabaseManager } from "@alice-database/DatabaseManager";
import { EmojiStatistics } from "@alice-database/utils/aliceDb/EmojiStatistics";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { GuildEmoji, GuildMember, MessageEmbed } from "discord.js";
import { emojistatisticsStrings } from "./emojistatisticsStrings";

export const run: Command["run"] = async (_, interaction) => {
    const stats: EmojiStatistics | null =
        await DatabaseManager.aliceDb.collections.emojiStatistics.getGuildStatistics(
            interaction.guild!
        );

    if (!stats) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                emojistatisticsStrings.serverHasNoData
            ),
        });
    }

    const validEmojis: {
        emoji: GuildEmoji;
        count: number;
        averagePerMonth: number;
    }[] = [];

    const currentDate: Date = new Date();

    for await (const emoji of stats.emojiStats.values()) {
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
        return interaction.editReply({
            content: MessageCreator.createReject(
                emojistatisticsStrings.noValidEmojis
            ),
        });
    }

    const sortOption: string =
        interaction.options.getString("sortoption") ?? "overall";

    validEmojis.sort((a, b) => {
        return sortOption === "overall"
            ? b.count - a.count
            : b.averagePerMonth - a.averagePerMonth;
    });

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed
        .setAuthor(
            `Emoji Statistics for ${interaction.guild!.name}`,
            interaction.guild!.iconURL({ dynamic: true })!
        )
        .setDescription(
            `**Sort Mode**: ${
                sortOption === "overall" ? "Overall" : "Average per month"
            } usage`
        );

    const onPageChange: OnButtonPageChange = async (_, page) => {
        for (
            let i = 5 * (page - 1);
            i < Math.min(validEmojis.length, 5 + 5 * (page - 1));
            ++i
        ) {
            embed.addField(
                `${i + 1}. ${validEmojis[i].emoji.name}`,
                `**Emoji**: ${validEmojis[i].emoji}\n` +
                    `**Date Creation**: ${validEmojis[
                        i
                    ].emoji.createdAt.toUTCString()}\n` +
                    `**Overall Usage**: ${validEmojis[
                        i
                    ].count.toLocaleString()}\n` +
                    `**Average Per Month Usage**: ${validEmojis[
                        i
                    ].averagePerMonth.toLocaleString()}`
            );
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        validEmojis,
        5,
        1,
        120,
        onPageChange
    );
};

export const category: Command["category"] = CommandCategory.TOOLS;

export const config: Command["config"] = {
    name: "emojistatistics",
    description: "Views statistics for emoji usage of the server.",
    options: [
        {
            name: "sortoption",
            type: ApplicationCommandOptionTypes.STRING,
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
