import { User } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { Constants } from "@alice-core/Constants";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { coinsStrings } from "../coinsStrings";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { OperationResult } from "@alice-interfaces/core/OperationResult";

export const run: Subcommand["run"] = async (_, interaction) => {
    if (!CommandHelper.isExecutedByBotOwner(interaction)) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.noPermissionReject),
        });
    }

    const userToAdd: User = interaction.options.getUser("user", true);

    const addAmount: number = interaction.options.getInteger("amount", true);

    if (!NumberHelper.isPositive(addAmount)) {
        return interaction.editReply({
            content: MessageCreator.createReject(coinsStrings.addAmountInvalid),
        });
    }

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            userToAdd
        );

    if (!playerInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                coinsStrings.otherUserDoesntHaveCoinsInfo
            ),
        });
    }

    const result: OperationResult = await playerInfo.incrementCoins(addAmount);

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                coinsStrings.addCoinFailed,
                <string>result.reason
            ),
        });
    }

    interaction.editReply(
        MessageCreator.createAccept(
            coinsStrings.addCoinSuccess,
            addAmount.toLocaleString(),
            (playerInfo.alicecoins + addAmount).toLocaleString()
        )
    );
};

export const config: Subcommand["config"] = {
    permissions: ["BOT_OWNER"],
};
