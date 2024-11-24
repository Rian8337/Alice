import { DatabaseManager } from "@database/DatabaseManager";
import { GuildTag } from "@database/utils/aliceDb/GuildTag";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { OnButtonPageChange } from "@structures/utils/OnButtonPageChange";
import { TagLocalization } from "@localization/interactions/commands/Fun/tag/TagLocalization";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@utils/creators/MessageButtonCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { bold, Collection, EmbedBuilder, User } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const localization: TagLocalization = new TagLocalization(
        CommandHelper.getLocale(interaction),
    );

    const user: User = interaction.options.getUser("user") ?? interaction.user;

    const tags: Collection<string, GuildTag> =
        await DatabaseManager.aliceDb.collections.guildTags.getUserGuildTags(
            interaction.guildId,
            user.id,
        );

    if (tags.size === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    user.id === interaction.user.id
                        ? "selfDoesntHaveTags"
                        : "userDoesntHaveTags",
                ),
            ),
        });
    }

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: interaction.member.displayColor,
    });

    const onPageChange: OnButtonPageChange = async (_, page) => {
        const tagList: string[] = [];

        for (
            let i = 10 * (page - 1);
            i < Math.min(tags.size, 10 + 10 * (page - 1));
            ++i
        ) {
            tagList.push(`${10 * (page - 1) + i + 1}. ${tags.at(i)!.name}`);
        }

        embed.setDescription(
            `${bold(
                `${localization.getTranslation("tagsForUser")} ${
                    interaction.user
                }`,
            )}\n` +
                `${bold(localization.getTranslation("totalTags"))}: ${
                    tags.size
                }\n\n` +
                tagList.join("\n"),
        );
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        1,
        Math.ceil(tags.size / 10),
        120,
        onPageChange,
    );
};
