import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Tag } from "@alice-interfaces/commands/Tools/Tag";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Collection, Util } from "discord.js";
import { tagStrings } from "../tagStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    if (!interaction.inGuild()) {
        return;
    }

    const name: string = interaction.options.getString("name", true);

    const content: string = Util.removeMentions(interaction.options.getString("content") ?? "");

    if (name.length > 30) {
        return interaction.editReply({
            content: MessageCreator.createReject(tagStrings.nameTooLong)
        });
    }

    if (content.length > 1500) {
        return interaction.editReply({
            content: MessageCreator.createReject(tagStrings.contentTooLong)
        });
    }

    const tags: Collection<string, Tag> = await DatabaseManager.aliceDb.collections.guildTags.getGuildTags(interaction.guildId);

    if (tags.has(name)) {
        return interaction.editReply({
            content: MessageCreator.createReject(tagStrings.tagExists)
        });
    }

    tags.set(
        name,
        {
            name: name,
            content: content,
            author: interaction.user.id,
            attachment_message: "",
            attachments: [],
            date: interaction.createdTimestamp
        }
    );

    await DatabaseManager.aliceDb.collections.guildTags.updateGuildTags(interaction.guildId, tags);

    interaction.editReply({
        content: MessageCreator.createAccept(
            tagStrings.addTagSuccessful, name
        )
    });
};

export const config: Subcommand["config"] = {
    permissions: []
};