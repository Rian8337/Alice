import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Tag } from "@alice-interfaces/commands/Tools/Tag";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { Collection, Message, MessageAttachment, Permissions, TextChannel } from "discord.js";
import { tagsStrings } from "../tagsStrings";

export const run: Subcommand["run"] = async (client, interaction) => {
    if (!interaction.inGuild()) {
        return;
    }

    const name: string = interaction.options.getString("name", true);

    const index: number = interaction.options.getInteger("index", true);

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

    // Allow server admins to unattach tags that violate rules
    if (tag.author !== interaction.user.id && !CommandHelper.checkPermission(interaction, Permissions.FLAGS.ADMINISTRATOR)) {
        return interaction.editReply({
            content: MessageCreator.createReject(tagsStrings.notTagOwner)
        });
    }

    if (!tag.attachment_message) {
        return interaction.editReply({
            content: MessageCreator.createReject(tagsStrings.tagDoesntHaveAttachments)
        });
    }

    if (tag.attachments.length < index) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                tagsStrings.deleteTagIndexOutOfBounds, tag.attachments.length.toString()
            )
        });
    }

    const channel: TextChannel = <TextChannel> await client.channels.fetch(Constants.tagAttachmentChannel);

    const message: Message = await channel.messages.fetch(tag.attachment_message);

    if (tag.attachments.length > 0) {
        tag.attachments.splice(index - 1, 1);

        await message.edit({
            attachments: tag.attachments.map((v, i) => new MessageAttachment(v, `attachment-${i + 1}.png`))
        });
    } else {
        await message.delete();

        tag.attachment_message = "";
        tag.attachments.length = 0;
    }

    tags.set(name, tag);

    await DatabaseManager.aliceDb.collections.guildTags.updateGuildTags(interaction.guildId, tags);

    interaction.editReply({
        content: MessageCreator.createAccept(tagsStrings.deleteTagAttachmentSuccessful)
    });
};

export const config: Subcommand["config"] = {
    permissions: []
};