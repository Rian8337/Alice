import { DatabaseManager } from "@database/DatabaseManager";
import { Warning } from "@database/utils/aliceDb/Warning";
import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { WarningLocalization } from "@localization/interactions/commands/Staff/warning/WarningLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { WarningManager } from "@utils/managers/WarningManager";

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

    const reason: string = interaction.options.getString("reason", true);

    await InteractionHelper.deferReply(interaction);

    const result: OperationResult = await WarningManager.unissue(
        interaction,
        warning,
        reason,
    );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("warnUnissueFailed"),
                result.reason!,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("warnUnissueSuccess"),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
