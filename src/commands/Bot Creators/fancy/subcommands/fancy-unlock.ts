import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { LoungeLockManager } from "@alice-utils/managers/LoungeLockManager";
import { User } from "discord.js";
import { FancyLocalization } from "@alice-localization/commands/Bot Creators/FancyLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { Language } from "@alice-localization/base/Language";

export const run: Subcommand["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: FancyLocalization = new FancyLocalization(language);

    const user: User = interaction.options.getUser("user", true);

    const reason: string = interaction.options.getString("reason", true);

    const result: OperationResult = await LoungeLockManager.unlock(
        user.id,
        reason,
        language
    );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("unlockProcessFailed"),
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("unlockProcessSuccessful")
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
