import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Tag } from "@alice-interfaces/commands/Tools/Tag";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Collection, GuildMember, MessageEmbed, User } from "discord.js";
import { tagStrings } from "../tagStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    if (!interaction.inGuild()) {
        return;
    }

    const user: User = interaction.options.getUser("user") ?? interaction.user;

    const tags: Collection<string, Tag> = await DatabaseManager.aliceDb.collections.guildTags.getGuildTags(interaction.guildId);

    if (tags.size === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                tagStrings.userDoesntHaveTags,
                user.id === interaction.user.id ? "you" : "this user"
            )
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed(
        { author: interaction.user, color: (<GuildMember> interaction.member).displayColor }
    );

    const onPageChange: OnButtonPageChange = async (options, page, contents: Tag[]) => {
        const embed: MessageEmbed = <MessageEmbed> options.embeds![0];

        embed.setDescription(
            `**Tags for ${interaction.user}**\n` +
            `**Total tags**: ${contents.length}\n\n` +
            contents
            .slice(10 * (page - 1), 10 + 10 * (page - 1))
            .map((v, i) => `${10 * (page - 1) + i + 1}. ${v.name}`)
            .join("\n")
        );

        options.embeds![0] = embed;
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [ embed ] },
        [interaction.user.id],
        [...tags.values()],
        10,
        1,
        120,
        onPageChange
    );
};

export const config: Subcommand["config"] = {
    permissions: []
};