import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { SettingsLocalization } from "@alice-localization/interactions/commands/Staff/settings/SettingsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    CommandUtilManager.globalCommandCooldown = interaction.options.getNumber(
        "duration",
        true
    );

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            new SettingsLocalization(
                await CommandHelper.getLocale(interaction)
            ).getTranslation("setGlobalCommandCooldownSuccess"),
            CommandUtilManager.globalCommandCooldown.toString()
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["BotOwner"],
};
