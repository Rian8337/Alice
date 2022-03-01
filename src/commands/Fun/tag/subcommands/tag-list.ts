import { DatabaseManager } from "@alice-database/DatabaseManager";
import { GuildTag } from "@alice-database/utils/aliceDb/GuildTag";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { TagLocalization } from "@alice-localization/commands/Fun/tag/TagLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { Collection, MessageEmbed, User } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const localization: TagLocalization = new TagLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const user: User = interaction.options.getUser("user") ?? interaction.user;

    const tags: Collection<string, GuildTag> =
        await DatabaseManager.aliceDb.collections.guildTags.getUserGuildTags(
            interaction.guildId,
            user.id
        );

    if (tags.size === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation(
                    user.id === interaction.user.id
                        ? "selfDoesntHaveTags"
                        : "userDoesntHaveTags"
                )
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: interaction.member.displayColor,
    });

    const onPageChange: OnButtonPageChange = async (
        _,
        page,
        contents: GuildTag[]
    ) => {
        embed.setDescription(
            `**${localization.getTranslation("tagsForUser")} ${
                interaction.user
            }**\n` +
                `**${localization.getTranslation("totalTags")}**: ${
                    contents.length
                }\n\n` +
                contents
                    .slice(10 * (page - 1), 10 + 10 * (page - 1))
                    .map((v, i) => `${10 * (page - 1) + i + 1}. ${v.name}`)
                    .join("\n")
        );
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        [...tags.values()],
        10,
        1,
        120,
        onPageChange
    );
};

export const config: Subcommand["config"] = {
    permissions: [],
};
