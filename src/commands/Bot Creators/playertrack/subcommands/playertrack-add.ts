import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { PlayertrackLocalization } from "@alice-localization/commands/Bot Creators/playertrack/PlayertrackLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const uid: number = interaction.options.getInteger("uid", true);

    await DatabaseManager.elainaDb.collections.playerTracking.addPlayer(uid);

    interaction.editReply({
        content: MessageCreator.createAccept(
            new PlayertrackLocalization(
                await CommandHelper.getLocale(interaction)
            ).getTranslation("nowTrackingUid"),
            uid.toString()
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
