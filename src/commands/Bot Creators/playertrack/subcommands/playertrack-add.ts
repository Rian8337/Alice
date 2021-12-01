import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { playertrackStrings } from "../playertrackStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const uid: number = interaction.options.getInteger("uid", true);

    await DatabaseManager.elainaDb.collections.playerTracking.addPlayer(uid);

    interaction.editReply({
        content: MessageCreator.createAccept(
            playertrackStrings.nowTrackingUid,
            uid.toString()
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
