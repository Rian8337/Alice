import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { GuildTag } from "@alice-database/utils/aliceDb/GuildTag";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { TagLocalization } from "@alice-localization/interactions/commands/Fun/tag/TagLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import {
    Message,
    MessageAttachment,
    Permissions,
    TextChannel,
} from "discord.js";

export const run: SlashSubcommand["run"] = async (client, interaction) => {
    if (!interaction.inGuild()) {
        return;
    }

    const localization: TagLocalization = new TagLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const name: string = interaction.options.getString("name", true);

    const index: number = interaction.options.getInteger("index", true);

    if (name.length > 30) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("nameTooLong")
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

    // Allow server admins to unattach tags that violate rules
    if (
        tag.author !== interaction.user.id &&
        !CommandHelper.checkPermission(
            interaction,
            Permissions.FLAGS.ADMINISTRATOR
        )
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("notTagOwner")
            ),
        });
    }

    if (!tag.attachment_message) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("tagDoesntHaveAttachments")
            ),
        });
    }

    if (tag.attachments.length < index) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("deleteTagIndexOutOfBounds"),
                tag.attachments.length.toString()
            ),
        });
    }

    const channel: TextChannel = <TextChannel>(
        await client.channels.fetch(Constants.tagAttachmentChannel)
    );

    const message: Message = await channel.messages.fetch(
        tag.attachment_message
    );

    if (tag.attachments.length > 0) {
        tag.attachments.splice(index - 1, 1);

        await message.edit({
            attachments: tag.attachments.map(
                (v, i) => new MessageAttachment(v, `attachment-${i + 1}.png`)
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
            localization.getTranslation("deleteTagAttachmentSuccessful")
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
