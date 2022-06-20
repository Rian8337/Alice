import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { GuildTag } from "@alice-database/utils/aliceDb/GuildTag";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { TagLocalization } from "@alice-localization/interactions/commands/Fun/tag/TagLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { Message, MessageAttachment, TextChannel } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (
    client,
    interaction
) => {
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
        return InteractionHelper.reply(interaction, {
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
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("tagDoesntExist")
            ),
        });
    }

    if (tag.author !== interaction.user.id) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("notTagOwner")
            ),
        });
    }

    if (tag.attachments.length >= 3) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noTagAttachmentSlot")
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

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

            InteractionHelper.reply(interaction, {
                content: MessageCreator.createAccept(
                    localization.getTranslation("attachToTagSuccessful"),
                    name
                ),
            });
        } catch {
            InteractionHelper.reply(interaction, {
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

            InteractionHelper.reply(interaction, {
                content: MessageCreator.createAccept(
                    localization.getTranslation("attachToTagSuccessful"),
                    name
                ),
            });
        } catch {
            InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("tagAttachmentTooBig")
                ),
            });
        }
    }
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
