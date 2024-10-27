import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { WarningLocalization } from "@localization/interactions/commands/Staff/warning/WarningLocalization";
import { MessageButtonCreator } from "@utils/creators/MessageButtonCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { WarningManager } from "@utils/managers/WarningManager";
import { User } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: WarningLocalization = new WarningLocalization(
        CommandHelper.getLocale(interaction),
    );

    const fromUser: User = interaction.options.getUser("from", true);

    const toUser: User = interaction.options.getUser("to", true);

    if (fromUser.id === toUser.id) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("cannotTransferToSamePerson"),
            ),
        });
    }

    const reason: string | null = interaction.options.getString("reason");

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("transferWarningConfirmation"),
            ),
        },
        [interaction.user.id],
        20,
        localization.language,
    );

    if (!confirmation) {
        return;
    }

    const result: OperationResult = await WarningManager.transfer(
        interaction,
        fromUser.id,
        toUser.id,
        reason,
    );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("warnTransferFailed"),
                result.reason!,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("warnTransferSuccess"),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["Administrator"],
};
