import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Tag } from "@alice-interfaces/commands/Tools/Tag";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { Collection, Permissions, Util } from "discord.js";
import { tagsStrings } from "../tagsStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    if (!interaction.inGuild()) {
        return;
    }

    const name: string = interaction.options.getString("name", true);

    const content: string = Util.removeMentions(interaction.options.getString("content") ?? "");

    if (name.length > 30) {
        return interaction.editReply({
            content: MessageCreator.createReject(tagsStrings.nameTooLong)
        });
    }

    if (content.length > 1500) {
        return interaction.editReply({
            content: MessageCreator.createReject(tagsStrings.contentTooLong)
        });
    }

    const tags: Collection<string, Tag> = await DatabaseManager.aliceDb.collections.guildTags.getGuildTags(interaction.guildId);

    const tag: Tag | undefined = tags.get(name);

    if (!tag) {
        return interaction.editReply({
            content: MessageCreator.createReject(tagsStrings.tagDoesntExist)
        });
    }

    // Allow server admins to edit tags that violate rules
    if (tag.author !== interaction.user.id && !CommandHelper.checkPermission(interaction, Permissions.FLAGS.ADMINISTRATOR)) {
        return interaction.editReply({
            content: MessageCreator.createReject(tagsStrings.notTagOwner)
        });
    }

    tag.content = content;

    tags.set(name, tag);

    await DatabaseManager.aliceDb.collections.guildTags.updateGuildTags(interaction.guildId, tags);

    interaction.editReply({
        content: MessageCreator.createAccept(tagsStrings.editTagSuccessful)
    });
};

export const config: Subcommand["config"] = {
    permissions: []
};