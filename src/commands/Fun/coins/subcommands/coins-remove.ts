import { GuildEmoji, User } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { Constants } from "@alice-core/Constants";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { coinsStrings } from "../coinsStrings";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { DatabaseOperationResult } from "@alice-interfaces/database/DatabaseOperationResult";

export const run: Subcommand["run"] = async (client, interaction) => {
    const userToRemove: User = interaction.options.getUser("user", true);

    const removeAmount: number = interaction.options.getInteger("amount", true);

    if (!NumberHelper.isPositive(removeAmount)) {
        return interaction.editReply({
            content: MessageCreator.createReject(coinsStrings.removeAmountInvalid)
        });
    }

    const playerInfo: PlayerInfo | null = await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(userToRemove);

    if (!playerInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(coinsStrings.otherUserDoesntHaveCoinsInfo)
        });
    }

    const result: DatabaseOperationResult = await playerInfo.incrementCoins(-removeAmount);

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(coinsStrings.removeCoinFailed, result.reason!)
        });
    }

    const coin: GuildEmoji = client.emojis.resolve(Constants.aliceCoinEmote)!;

    interaction.editReply({
        content: MessageCreator.createAccept(
            coinsStrings.removeCoinSuccess,
            coin.toString(),
            removeAmount.toLocaleString(),
            coin.toString(),
            (playerInfo.alicecoins - removeAmount).toLocaleString()
        )
    });
};

export const config: Subcommand["config"] = {
    permissions: ["BOT_OWNER"]
};