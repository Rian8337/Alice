import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { SettingsLocalization } from "@alice-localization/commands/Staff/SettingsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";

export const run: Subcommand["run"] = async (_, interaction) => {
    CommandUtilManager.globalCommandCooldown = interaction.options.getNumber(
        "duration",
        true
    );

    interaction.editReply({
        content: MessageCreator.createAccept(
            new SettingsLocalization(
                await CommandHelper.getLocale(interaction)
            ).getTranslation("setGlobalCommandCooldownSuccess"),
            CommandUtilManager.globalCommandCooldown.toString()
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["BOT_OWNER"],
};
