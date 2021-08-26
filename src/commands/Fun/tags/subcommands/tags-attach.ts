import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Tag } from "@alice-interfaces/commands/Tools/Tag";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { Collection, Message, MessageAttachment, TextChannel } from "discord.js";
import { tagsStrings } from "../tagsStrings";

export const run: Subcommand["run"] = async (client, interaction) => {
    if (!interaction.inGuild()) {
        return;
    }

    const name: string = interaction.options.getString("name", true);

    const url: string = interaction.options.getString("url", true);

    if (!StringHelper.isValidImage(url)) {
        return interaction.editReply({
            content: MessageCreator.createReject(tagsStrings.tagAttachmentURLInvalid)
        });
    }

    const tags: Collection<string, Tag> = await DatabaseManager.aliceDb.collections.guildTags.getGuildTags(interaction.guildId);

    const tag: Tag | undefined = tags.get(name);

    if (!tag) {
        return interaction.editReply({
            content: MessageCreator.createReject(tagsStrings.tagDoesntExist)
        });
    }

    if (tag.author !== interaction.user.id) {
        return interaction.editReply({
            content: MessageCreator.createReject(tagsStrings.notTagOwner)
        });
    }

    if (tag.attachments.length >= 3) {
        return interaction.editReply({
            content: MessageCreator.createReject(tagsStrings.noTagAttachmentSlot)
        });
    }

    const image: MessageAttachment = new MessageAttachment(url, `attachment-${tag.attachments.length + 1}.png`);

    const channel: TextChannel = <TextChannel> await client.channels.fetch(Constants.tagAttachmentChannel);

    if (tag.attachments.length > 0) {
        const message: Message = await channel.messages.fetch(tag.attachment_message);

        const finalAttachments: MessageAttachment[] = tag.attachments.map((v, i) => new MessageAttachment(v, `attachment-${i + 1}.png`));

        finalAttachments.push(image);

        try {
            const editedMessage: Message = await message.edit({
                attachments: finalAttachments
            });

            tag.attachments = editedMessage.attachments.map(v => v.url);

            tags.set(name, tag);

            await DatabaseManager.aliceDb.collections.guildTags.updateGuildTags(interaction.guildId, tags);

            interaction.editReply({
                content: MessageCreator.createAccept(tagsStrings.attachToTagSuccessful)
            });
        } catch (ignored) {
            interaction.editReply({
                content: MessageCreator.createReject(tagsStrings.tagAttachmentTooBig)
            });
        }
    } else {
        try {
            const message: Message = await channel.send({
                content: `**Tag by ${interaction.user}**\n` +
                    `**User ID**: ${interaction.user.id}\n` +
                    `**Name**: \`${name}\`\n` +
                    `**Created at ${interaction.createdAt.toUTCString()}**`,
                files: [ image ]
            });

            tag.attachment_message = message.id;
            tag.attachments.push(url);

            tags.set(name, tag);

            await DatabaseManager.aliceDb.collections.guildTags.updateGuildTags(interaction.guildId, tags);

            interaction.editReply({
                content: MessageCreator.createAccept(tagsStrings.attachToTagSuccessful)
            });
        } catch (ignored) {
            interaction.editReply({
                content: MessageCreator.createReject(tagsStrings.tagAttachmentTooBig)
            });
        }
    }
};

export const config: Subcommand["config"] = {
    permissions: []
};