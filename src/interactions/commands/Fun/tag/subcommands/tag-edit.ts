import { DatabaseManager } from "@alice-database/DatabaseManager";
import { GuildTag } from "@alice-database/utils/aliceDb/GuildTag";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { TagLocalization } from "@alice-localization/interactions/commands/Fun/tag/TagLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { PermissionsBitField } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    if (!interaction.inGuild()) {
        return;
    }

    const localization: TagLocalization = new TagLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const name: string = interaction.options.getString("name", true);

    const content: string = interaction.options.getString("content") ?? "";

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

    // Allow server admins to edit tags that violate rules
    if (
        tag.author !== interaction.user.id &&
        !CommandHelper.checkPermission(
            interaction,
            PermissionsBitField.Flags.Administrator
        )
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("notTagOwner")
            ),
        });
    }

    tag.content = content;

    await tag.updateTag();

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("editTagSuccessful"),
            name
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
