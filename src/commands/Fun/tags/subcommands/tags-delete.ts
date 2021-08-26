import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Tag } from "@alice-interfaces/commands/Tools/Tag";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { Collection, Message, Permissions, TextChannel } from "discord.js";
import { tagsStrings } from "../tagsStrings";

export const run: Subcommand["run"] = async (client, interaction) => {
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

    // Allow server admins to delete tags that violate rules
    if (tag.author !== interaction.user.id && !CommandHelper.checkPermission(interaction, Permissions.FLAGS.ADMINISTRATOR)) {
        return interaction.editReply({
            content: MessageCreator.createReject(tagsStrings.notTagOwner)
        });
    }

    tags.delete(name);

    // Also delete attachment
    if (tag.attachment_message) {
        const channel: TextChannel = <TextChannel> await client.channels.fetch(Constants.tagAttachmentChannel);

        const message: Message = await channel.messages.fetch(tag.attachment_message);

        await message.delete();
    }

    await DatabaseManager.aliceDb.collections.guildTags.updateGuildTags(interaction.guildId, tags);

    interaction.editReply({
        content: MessageCreator.createAccept(tagsStrings.deleteTagSuccessful)
    });
};

export const config: Subcommand["config"] = {
    permissions: []
};