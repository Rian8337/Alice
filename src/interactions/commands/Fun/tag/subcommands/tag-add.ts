import { DatabaseManager } from "@alice-database/DatabaseManager";
import { GuildTag } from "@alice-database/utils/aliceDb/GuildTag";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { TagLocalization } from "@alice-localization/interactions/commands/Fun/tag/TagLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    if (!interaction.inGuild()) {
        return;
    }

    const localization: TagLocalization = new TagLocalization(
        CommandHelper.getLocale(interaction),
    );

    const name: string = interaction.options.getString("name", true);

    const content: string = interaction.options.getString("content") ?? "";

    const tag: GuildTag | null =
        await DatabaseManager.aliceDb.collections.guildTags.getByName(
            interaction.guildId,
            name,
        );

    if (tag) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("tagExists"),
            ),
        });
    }

    await DatabaseManager.aliceDb.collections.guildTags.insert({
        guildid: interaction.guildId,
        name: name,
        content: content,
        author: interaction.user.id,
        attachment_message: "",
        attachments: [],
        date: interaction.createdTimestamp,
    });

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("addTagSuccessful"),
            name,
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
