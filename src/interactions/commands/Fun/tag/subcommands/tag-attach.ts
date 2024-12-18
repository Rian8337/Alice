import { Constants } from "@core/Constants";
import { DatabaseManager } from "@database/DatabaseManager";
import { GuildTag } from "@database/utils/aliceDb/GuildTag";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { TagLocalization } from "@localization/interactions/commands/Fun/tag/TagLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { StringHelper } from "@utils/helpers/StringHelper";
import {
    Attachment,
    AttachmentBuilder,
    bold,
    Message,
    TextChannel,
} from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (
    client,
    interaction,
) => {
    if (!interaction.inGuild()) {
        return;
    }

    const localization: TagLocalization = new TagLocalization(
        CommandHelper.getLocale(interaction),
    );

    const name: string = interaction.options.getString("name", true);

    const attachment: Attachment = interaction.options.getAttachment(
        "attachment",
        true,
    );

    if (!StringHelper.isValidImage(attachment.url)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("tagAttachmentURLInvalid"),
            ),
        });
    }

    const tag: GuildTag | null =
        await DatabaseManager.aliceDb.collections.guildTags.getByName(
            interaction.guildId,
            name,
        );

    if (!tag) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("tagDoesntExist"),
            ),
        });
    }

    if (tag.author !== interaction.user.id) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("notTagOwner"),
            ),
        });
    }

    if (tag.attachments.length >= 3) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noTagAttachmentSlot"),
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const builder: AttachmentBuilder = new AttachmentBuilder(attachment.url, {
        name: `${tag.attachments.length + 1}${attachment.url.substring(
            attachment.url.lastIndexOf("."),
        )}`,
    });

    const channel: TextChannel = <TextChannel>(
        await client.channels.fetch(Constants.tagAttachmentChannel)
    );

    if (tag.attachments.length > 0) {
        const message: Message = await channel.messages.fetch(
            tag.attachment_message,
        );

        const finalAttachments: AttachmentBuilder[] = tag.attachments.map(
            (v, i) =>
                new AttachmentBuilder(v, { name: `attachment-${i + 1}.png` }),
        );

        finalAttachments.push(builder);

        try {
            const editedMessage: Message = await message.edit({
                files: finalAttachments,
            });

            tag.attachments = editedMessage.attachments.map((v) => v.url);

            await tag.updateTag();

            InteractionHelper.reply(interaction, {
                content: MessageCreator.createAccept(
                    localization.getTranslation("attachToTagSuccessful"),
                    name,
                ),
            });
        } catch {
            InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("tagAttachmentTooBig"),
                ),
            });
        }
    } else {
        try {
            const message: Message = await channel.send({
                content:
                    `${bold(`Tag by ${interaction.user}`)}\n` +
                    `${bold("User ID")}: ${interaction.user.id}\n` +
                    `${bold("Name")}: \`${name}\`\n` +
                    bold(`Created at ${interaction.createdAt.toUTCString()}`),
                files: [attachment],
            });

            tag.attachment_message = message.id;
            tag.attachments.push(attachment.url);

            await tag.updateTag();

            InteractionHelper.reply(interaction, {
                content: MessageCreator.createAccept(
                    localization.getTranslation("attachToTagSuccessful"),
                    name,
                ),
            });
        } catch {
            InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("tagAttachmentTooBig"),
                ),
            });
        }
    }
};
