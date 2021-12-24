import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";
import { settingsStrings } from "../../../settingsStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    CommandUtilManager.globalCommandCooldown = interaction.options.getNumber(
        "duration",
        true
    );

    interaction.editReply({
        content: MessageCreator.createAccept(
            settingsStrings.setGlobalCommandCooldownSuccess,
            CommandUtilManager.globalCommandCooldown.toString()
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["BOT_OWNER"],
};
