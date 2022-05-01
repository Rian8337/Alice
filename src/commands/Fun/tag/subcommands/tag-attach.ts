import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { GuildTag } from "@alice-database/utils/aliceDb/GuildTag";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { TagLocalization } from "@alice-localization/commands/Fun/tag/TagLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { Message, MessageAttachment, TextChannel } from "discord.js";

export const run: Subcommand["run"] = async (client, interaction) => {
    if (!interaction.inGuild()) {
        return;
    }

    const localization: TagLocalization = new TagLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const name: string = interaction.options.getString("name", true);

    const attachment: MessageAttachment = interaction.options.getAttachment(
        "attachment",
        true
    );

    if (!StringHelper.isValidImage(attachment.url)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("tagAttachmentURLInvalid")
            ),
        });
    }

    const tag: GuildTag | null =
        await DatabaseManager.aliceDb.collections.guildTags.getByName(
            interaction.guildId,
            name
        );

    if (!tag) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("tagDoesntExist")
            ),
        });
    }

    if (tag.author !== interaction.user.id) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("notTagOwner")
            ),
        });
    }

    if (tag.attachments.length >= 3) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("noTagAttachmentSlot")
            ),
        });
    }

    attachment.setName(
        `${tag.attachments.length + 1}${attachment.url.substring(
            attachment.url.lastIndexOf(".")
        )}`
    );

    const channel: TextChannel = <TextChannel>(
        await client.channels.fetch(Constants.tagAttachmentChannel)
    );

    if (tag.attachments.length > 0) {
        const message: Message = await channel.messages.fetch(
            tag.attachment_message
        );

        const finalAttachments: MessageAttachment[] = tag.attachments.map(
            (v, i) => new MessageAttachment(v, `attachment-${i + 1}.png`)
        );

        finalAttachments.push(attachment);

        try {
            const editedMessage: Message = await message.edit({
                attachments: finalAttachments,
            });

            tag.attachments = editedMessage.attachments.map((v) => v.url);

            await tag.updateTag();

            interaction.editReply({
                content: MessageCreator.createAccept(
                    localization.getTranslation("attachToTagSuccessful"),
                    name
                ),
            });
        } catch {
            interaction.editReply({
                content: MessageCreator.createReject(
                    localization.getTranslation("tagAttachmentTooBig")
                ),
            });
        }
    } else {
        try {
            const message: Message = await channel.send({
                content:
                    `**Tag by ${interaction.user}**\n` +
                    `**User ID**: ${interaction.user.id}\n` +
                    `**Name**: \`${name}\`\n` +
                    `**Created at ${interaction.createdAt.toUTCString()}**`,
                files: [attachment],
            });

            tag.attachment_message = message.id;
            tag.attachments.push(attachment.url);

            await tag.updateTag();

            interaction.editReply({
                content: MessageCreator.createAccept(
                    localization.getTranslation("attachToTagSuccessful"),
                    name
                ),
            });
        } catch {
            interaction.editReply({
                content: MessageCreator.createReject(
                    localization.getTranslation("tagAttachmentTooBig")
                ),
            });
        }
    }
};

export const config: Subcommand["config"] = {
    permissions: [],
};
