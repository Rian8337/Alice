import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";
import { settingsStrings } from "../../../settingsStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const cooldown: number = interaction.options.getNumber("duration", true);

    CommandUtilManager.globalCommandCooldown = NumberHelper.clamp(
        cooldown,
        5,
        3600
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
