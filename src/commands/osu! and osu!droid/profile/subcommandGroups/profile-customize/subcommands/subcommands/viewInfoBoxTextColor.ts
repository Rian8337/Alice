import { profileStrings } from "@alice-commands/osu! and osu!droid/profile/profileStrings";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";

export const run: Subcommand["run"] = async (_, interaction) => {
    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            interaction.user
        );
    const color: string = playerInfo?.picture_config.bgColor ?? "#008BFF";

    interaction.editReply({
        content: MessageCreator.createAccept(
            profileStrings.infoBoxColorInfo,
            "text " + color.includes(",") ? "RGBA color" : "color hex code",
            color
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
