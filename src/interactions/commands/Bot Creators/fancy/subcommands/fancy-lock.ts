import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { LoungeLockManager } from "@utils/managers/LoungeLockManager";
import { FancyLocalization } from "@localization/interactions/commands/Bot Creators/fancy/FancyLocalization";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization = new FancyLocalization(
        CommandHelper.getLocale(interaction),
    );

    const user = interaction.options.getUser("user", true);

    const duration = CommandHelper.convertStringTimeFormat(
        interaction.options.getString("duration", true),
    );

    const reason = interaction.options.getString("reason", true);

    if (!Number.isFinite(duration)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("durationError"),
            ),
        });
    }

    const result = await LoungeLockManager.lock(
        user.id,
        reason,
        duration,
        localization.language,
    );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("lockProcessFailed"),
                result.reason!,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("lockProcessSuccessful"),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
