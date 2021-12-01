import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { GuildTag } from "@alice-database/utils/aliceDb/GuildTag";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { Message, Permissions, TextChannel } from "discord.js";
import { tagStrings } from "../tagStrings";

export const run: Subcommand["run"] = async (client, interaction) => {
    if (!interaction.inGuild()) {
        return;
    }

    const name: string = interaction.options.getString("name", true);

    if (name.length > 30) {
        return interaction.editReply({
            content: MessageCreator.createReject(tagStrings.nameTooLong),
        });
    }

    const tag: GuildTag | null =
        await DatabaseManager.aliceDb.collections.guildTags.getByName(
            interaction.guildId,
            name
        );

    if (!tag) {
        return interaction.editReply({
            content: MessageCreator.createReject(tagStrings.tagDoesntExist),
        });
    }

    // Allow server admins to delete tags that violate rules
    if (
        tag.author !== interaction.user.id &&
        !CommandHelper.checkPermission(
            interaction,
            Permissions.FLAGS.ADMINISTRATOR
        )
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(tagStrings.notTagOwner),
        });
    }

    // Also delete attachment
    if (tag.attachment_message) {
        const channel: TextChannel = <TextChannel>(
            await client.channels.fetch(Constants.tagAttachmentChannel)
        );

        const message: Message = await channel.messages.fetch(
            tag.attachment_message
        );

        await message.delete();
    }

    await DatabaseManager.aliceDb.collections.guildTags.delete({
        guildid: tag.guildid,
        name: tag.name,
    });

    interaction.editReply({
        content: MessageCreator.createAccept(
            tagStrings.deleteTagSuccessful,
            name
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
