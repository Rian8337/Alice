import { Constants } from "@core/Constants";
import { DatabaseManager } from "@database/DatabaseManager";
import { GuildTag } from "@database/utils/aliceDb/GuildTag";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { TagLocalization } from "@localization/interactions/commands/Fun/tag/TagLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { Message, PermissionsBitField, TextChannel } from "discord.js";

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

    // Allow server admins to delete tags that violate rules
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

    // Also delete attachment
    if (tag.attachment_message) {
        await InteractionHelper.deferReply(interaction);

        const channel: TextChannel = <TextChannel>(
            await client.channels.fetch(Constants.tagAttachmentChannel)
        );

        const message: Message = await channel.messages.fetch(
            tag.attachment_message,
        );

        await message.delete();
    }

    await DatabaseManager.aliceDb.collections.guildTags.deleteOne({
        guildid: tag.guildid,
        name: tag.name,
    });

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("deleteTagSuccessful"),
            name,
        ),
    });
};
