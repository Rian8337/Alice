import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Tag } from "@alice-interfaces/commands/Tools/Tag";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Collection, GuildMember, MessageEmbed } from "discord.js";
import { tagsStrings } from "../tagsStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    if (!interaction.inGuild()) {
        return;
    }

    const name: string = interaction.options.getString("name", true);

    const tags: Collection<string, Tag> = await DatabaseManager.aliceDb.collections.guildTags.getGuildTags(interaction.guildId);

    const tag: Tag | undefined = tags.get(name);

    if (!tag) {
        return interaction.editReply({
            content: MessageCreator.createReject(tagsStrings.tagDoesntExist)
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed(
        { author: interaction.user, color: (<GuildMember> interaction.member).displayColor }
    );

    embed.setTitle("Tag Information")
        .setDescription(
            `**Name**: ${tag.name}\n` +
            `**Author**: <@${tag.author}>\n` +
            `**Creation Date**: ${new Date(tag.date).toUTCString()}\n` +
            `**Attachments**: ${tag.attachments.length}`
        );

    interaction.editReply({
        embeds: [ embed ]
    });
};

export const config: Subcommand["config"] = {
    permissions: []
};