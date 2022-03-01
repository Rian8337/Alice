import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Warning } from "@alice-database/utils/aliceDb/Warning";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { WarningLocalization } from "@alice-localization/commands/Staff/warning/WarningLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { WarningManager } from "@alice-utils/managers/WarningManager";
import { MessageEmbed } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: WarningLocalization = new WarningLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const warning: Warning | null =
        await DatabaseManager.aliceDb.collections.userWarning.getByGuildWarningId(
            interaction.guildId!,
            interaction.options.getInteger("id", true)
        );

    if (!warning) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("warningNotFound")
            ),
        });
    }

    if (
        warning.discordId !== interaction.user.id &&
        interaction.inCachedGuild() &&
        !(await WarningManager.userCanWarn(interaction.member))
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("noPermissionToViewWarning")
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createWarningEmbed(
        warning,
        localization.language
    );

    interaction.editReply({
        embeds: [embed],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
