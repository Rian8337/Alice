import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { SettingsLocalization } from "@localization/interactions/commands/Staff/settings/SettingsLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { CommandUtilManager } from "@utils/managers/CommandUtilManager";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    CommandUtilManager.globalCommandCooldown = interaction.options.getNumber(
        "duration",
        true,
    );

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            new SettingsLocalization(
                CommandHelper.getLocale(interaction),
            ).getTranslation("setGlobalCommandCooldownSuccess"),
            CommandUtilManager.globalCommandCooldown.toString(),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["BotOwner"],
};
