import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Warning } from "@alice-database/utils/aliceDb/Warning";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { WarningLocalization } from "@alice-localization/commands/Staff/warning/WarningLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { WarningManager } from "@alice-utils/managers/WarningManager";

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

    const reason: string = interaction.options.getString("reason", true);

    const result: OperationResult = await WarningManager.unissue(
        interaction,
        warning,
        reason
    );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("warnUnissueFailed"),
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("warnUnissueSuccess")
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};