import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { LoungeLockManager } from "@alice-utils/managers/LoungeLockManager";
import { User } from "discord.js";
import { FancyLocalization } from "@alice-localization/commands/Bot Creators/FancyLocalization";
import { Language } from "@alice-localization/base/Language";

export const run: Subcommand["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: FancyLocalization = new FancyLocalization(language);

    const user: User = interaction.options.getUser("user", true);

    const duration: number = CommandHelper.convertStringTimeFormat(
        interaction.options.getString("duration", true)
    );

    const reason: string = interaction.options.getString("reason", true);

    if (!Number.isFinite(duration)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("durationError")
            ),
        });
    }

    const result: OperationResult = await LoungeLockManager.lock(
        user.id,
        reason,
        duration,
        language
    );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("lockProcessFailed"),
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("lockProcessSuccessful")
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
