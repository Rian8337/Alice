import { DatabaseManager } from "@alice-database/DatabaseManager";
import { GuildTag } from "@alice-database/utils/aliceDb/GuildTag";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MessageEmbed } from "discord.js";
import { tagStrings } from "../tagStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const name: string = interaction.options.getString("name", true);

    const tag: GuildTag | null =
        await DatabaseManager.aliceDb.collections.guildTags.getByName(
            interaction.guildId,
            name
        );

    if (!tag) {
        return interaction.editReply({
            content: MessageCreator.createReject(tagStrings.tagDoesntExist),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: interaction.member.displayColor,
    });

    embed
        .setTitle("Tag Information")
        .setDescription(
            `**Name**: ${tag.name}\n` +
                `**Author**: <@${tag.author}>\n` +
                `**Creation Date**: ${new Date(tag.date).toUTCString()}\n` +
                `**Attachments**: ${tag.attachments.length}`
        );

    interaction.editReply({
        embeds: [embed],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
