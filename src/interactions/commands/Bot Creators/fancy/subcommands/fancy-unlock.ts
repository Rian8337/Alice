import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { LoungeLockManager } from "@utils/managers/LoungeLockManager";
import { FancyLocalization } from "@localization/interactions/commands/Bot Creators/fancy/FancyLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization = new FancyLocalization(
        CommandHelper.getLocale(interaction),
    );

    const user = interaction.options.getUser("user", true);

    const reason = interaction.options.getString("reason", true);

    const result = await LoungeLockManager.unlock(
        user.id,
        reason,
        localization.language,
    );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("unlockProcessFailed"),
                result.reason!,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("unlockProcessSuccessful"),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
