import { User } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { coinsStrings } from "../coinsStrings";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";

export const run: Subcommand["run"] = async (_, interaction) => {
    const user: User = interaction.options.getUser("user") ?? interaction.user;

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(user);

    interaction.editReply(
        MessageCreator.createAccept(
            coinsStrings.coinAmountInfo,
            user.id === interaction.user.id ? "You have" : "That user has",
            (playerInfo?.alicecoins ?? 0).toLocaleString()
        )
    );
};

export const config: Subcommand["config"] = {
    permissions: [],
};
