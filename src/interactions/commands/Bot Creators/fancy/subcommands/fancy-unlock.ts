import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { OperationResult } from "structures/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { LoungeLockManager } from "@alice-utils/managers/LoungeLockManager";
import { User } from "discord.js";
import { FancyLocalization } from "@alice-localization/interactions/commands/Bot Creators/fancy/FancyLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: FancyLocalization = new FancyLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const user: User = interaction.options.getUser("user", true);

    const reason: string = interaction.options.getString("reason", true);

    const result: OperationResult = await LoungeLockManager.unlock(
        user.id,
        reason,
        localization.language
    );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("unlockProcessFailed"),
                result.reason!
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("unlockProcessSuccessful")
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
