import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Warning } from "@alice-database/utils/aliceDb/Warning";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { WarningLocalization } from "@alice-localization/interactions/commands/Staff/warning/WarningLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { WarningManager } from "@alice-utils/managers/WarningManager";
import { EmbedBuilder } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: WarningLocalization = new WarningLocalization(
        CommandHelper.getLocale(interaction),
    );

    const warning: Warning | null =
        await DatabaseManager.aliceDb.collections.userWarning.getByGuildWarningId(
            interaction.guildId!,
            interaction.options.getInteger("id", true),
        );

    if (!warning) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("warningNotFound"),
            ),
        });
    }

    if (
        warning.discordId !== interaction.user.id &&
        interaction.inCachedGuild() &&
        !(await WarningManager.userCanWarn(interaction.member))
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noPermissionToViewWarning"),
            ),
        });
    }

    const embed: EmbedBuilder = EmbedCreator.createWarningEmbed(
        warning,
        localization.language,
    );

    InteractionHelper.reply(interaction, {
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
