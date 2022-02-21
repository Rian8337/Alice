import { DatabaseManager } from "@alice-database/DatabaseManager";
import { GuildTag } from "@alice-database/utils/aliceDb/GuildTag";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { TagLocalization } from "@alice-localization/commands/Fun/TagLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { MessageOptions } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    if (!interaction.inGuild()) {
        return;
    }

    const localization: TagLocalization = new TagLocalization(await CommandHelper.getLocale(interaction));

    const name: string = interaction.options.getString("name", true);

    if (name.length > 30) {
        return interaction.editReply({
            content: MessageCreator.createReject(localization.getTranslation("nameTooLong")),
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

    if (!tag.content && tag.attachments.length === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("tagDoesntHaveContentAndAttachments")
            ),
        });
    }

    const options: MessageOptions = {};

    if (tag.content) {
        options.content = tag.content;
    }

    if (tag.attachments) {
        options.files = tag.attachments;
    }

    interaction.editReply(options);
};

export const config: Subcommand["config"] = {
    permissions: [],
};
