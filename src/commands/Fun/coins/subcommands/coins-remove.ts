import { User } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { coinsStrings } from "../coinsStrings";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { OperationResult } from "@alice-interfaces/core/OperationResult";

export const run: Subcommand["run"] = async (client, interaction) => {
    const userToRemove: User = interaction.options.getUser("user", true);

    const removeAmount: number = interaction.options.getInteger("amount", true);

    if (!NumberHelper.isPositive(removeAmount)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                coinsStrings.removeAmountInvalid
            ),
        });
    }

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            userToRemove
        );

    if (!playerInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                coinsStrings.otherUserDoesntHaveCoinsInfo
            ),
        });
    }

    const result: OperationResult = await playerInfo.incrementCoins(
        -removeAmount
    );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                coinsStrings.removeCoinFailed,
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            coinsStrings.removeCoinSuccess,
            removeAmount.toLocaleString(),
            (playerInfo.alicecoins - removeAmount).toLocaleString()
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["BOT_OWNER"],
};
