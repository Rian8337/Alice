import { Constants } from "@core/Constants";
import { DatabaseManager } from "@database/DatabaseManager";
import { GuildTag } from "@database/utils/aliceDb/GuildTag";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { TagLocalization } from "@localization/interactions/commands/Fun/tag/TagLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import {
    AttachmentBuilder,
    Message,
    PermissionsBitField,
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

    const index: number = interaction.options.getInteger("index", true);

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

    // Allow server admins to unattach tags that violate rules
    if (
        tag.author !== interaction.user.id &&
        !CommandHelper.checkPermission(
            interaction,
            PermissionsBitField.Flags.Administrator,
        )
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("notTagOwner"),
            ),
        });
    }

    if (!tag.attachment_message) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("tagDoesntHaveAttachments"),
            ),
        });
    }

    if (tag.attachments.length < index) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("deleteTagIndexOutOfBounds"),
                tag.attachments.length.toString(),
            ),
        });
    }

    const channel: TextChannel = <TextChannel>(
        await client.channels.fetch(Constants.tagAttachmentChannel)
    );

    const message: Message = await channel.messages.fetch(
        tag.attachment_message,
    );

    if (tag.attachments.length > 0) {
        tag.attachments.splice(index - 1, 1);

        await message.edit({
            files: tag.attachments.map(
                (v, i) =>
                    new AttachmentBuilder(v, {
                        name: `attachment-${i + 1}.png`,
                    }),
            ),
        });
    } else {
        await message.delete();

        tag.attachment_message = "";
        tag.attachments.length = 0;
    }

    await tag.updateTag();

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("deleteTagAttachmentSuccessful"),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
