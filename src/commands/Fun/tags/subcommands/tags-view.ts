import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Tag } from "@alice-interfaces/commands/Tools/Tag";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Collection } from "discord.js";
import { tagsStrings } from "../tagsStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    if (!interaction.inGuild()) {
        return;
    }

    const name: string = interaction.options.getString("name", true);

    if (name.length > 30) {
        return interaction.editReply({
            content: MessageCreator.createReject(tagsStrings.nameTooLong)
        });
    }

    const tags: Collection<string, Tag> = await DatabaseManager.aliceDb.collections.guildTags.getGuildTags(interaction.guildId);

    const tag: Tag | undefined = tags.get(name);

    if (!tag) {
        return interaction.editReply({
            content: MessageCreator.createReject(tagsStrings.tagDoesntExist)
        });
    }

    if (!tag.content && tag.attachments.length === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(tagsStrings.tagDoesntHaveContentAndAttachments)
        });
    }

    interaction.editReply({
        content: tag.content,
        files: tag.attachments
    });
};

export const config: Subcommand["config"] = {
    permissions: []
};