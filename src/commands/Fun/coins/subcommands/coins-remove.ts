import { User } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { CoinsLocalization } from "@alice-localization/commands/Fun/CoinsLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { Language } from "@alice-localization/base/Language";

export const run: Subcommand["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: CoinsLocalization = new CoinsLocalization(language);

    const userToRemove: User = interaction.options.getUser("user", true);

    const removeAmount: number = interaction.options.getInteger("amount", true);

    if (!NumberHelper.isPositive(removeAmount)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("removeAmountInvalid")
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
                localization.getTranslation("otherUserDoesntHaveCoinsInfo")
            ),
        });
    }

    const result: OperationResult = await playerInfo.incrementCoins(
        -removeAmount,
        language
    );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("removeCoinFailed"),
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("removeCoinSuccess"),
            removeAmount.toLocaleString(),
            (playerInfo.alicecoins - removeAmount).toLocaleString()
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["BOT_OWNER"],
};
