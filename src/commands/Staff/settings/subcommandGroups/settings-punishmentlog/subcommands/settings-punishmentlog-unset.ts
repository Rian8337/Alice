import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { settingsStrings } from "../../../settingsStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    await DatabaseManager.aliceDb.collections.guildPunishmentConfig.unsetGuildLogChannel(
        interaction.guildId!
    );

    interaction.editReply({
        content: MessageCreator.createAccept(
            settingsStrings.unsetLogChannelSuccess
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["MANAGE_GUILD"],
};
