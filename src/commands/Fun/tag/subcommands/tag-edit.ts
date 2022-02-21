import { DatabaseManager } from "@alice-database/DatabaseManager";
import { GuildTag } from "@alice-database/utils/aliceDb/GuildTag";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { TagLocalization } from "@alice-localization/commands/Fun/TagLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { Permissions, Util } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    if (!interaction.inGuild()) {
        return;
    }

    const localization: TagLocalization = new TagLocalization(await CommandHelper.getLocale(interaction));

    const name: string = interaction.options.getString("name", true);

    const content: string = Util.removeMentions(
        interaction.options.getString("content") ?? ""
    );

    if (name.length > 30) {
        return interaction.editReply({
            content: MessageCreator.createReject(localization.getTranslation("nameTooLong")),
        });
    }

    if (content.length > 1500) {
        return interaction.editReply({
            content: MessageCreator.createReject(localization.getTranslation("contentTooLong")),
        });
    }

    const tag: GuildTag | null =
        await DatabaseManager.aliceDb.collections.guildTags.getByName(
            interaction.guildId,
            name
        );

    if (!tag) {
        return interaction.editReply({
            content: MessageCreator.createReject(localization.getTranslation("tagDoesntExist")),
        });
    }

    // Allow server admins to edit tags that violate rules
    if (
        tag.author !== interaction.user.id &&
        !CommandHelper.checkPermission(
            interaction,
            Permissions.FLAGS.ADMINISTRATOR
        )
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(localization.getTranslation("notTagOwner")),
        });
    }

    tag.content = content;

    await tag.updateTag();

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("editTagSuccessful"),
            name
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
