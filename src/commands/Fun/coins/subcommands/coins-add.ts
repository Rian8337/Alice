import { User } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { Constants } from "@alice-core/Constants";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Language } from "@alice-localization/base/Language";
import { CoinsLocalization } from "@alice-localization/commands/Fun/CoinsLocalization";
import { ConstantsLocalization } from "@alice-localization/core/ConstantsLocalization";

export const run: Subcommand["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: CoinsLocalization = new CoinsLocalization(language);

    if (!CommandHelper.isExecutedByBotOwner(interaction)) {
        const constantsLocalization: ConstantsLocalization = new ConstantsLocalization(language);

        return interaction.editReply({
            content: MessageCreator.createReject(constantsLocalization.getTranslation(Constants.noPermissionReject)),
        });
    }

    const userToAdd: User = interaction.options.getUser("user", true);

    const addAmount: number = interaction.options.getInteger("amount", true);

    if (!NumberHelper.isPositive(addAmount)) {
        return interaction.editReply({
            content: MessageCreator.createReject(localization.getTranslation("addAmountInvalid")),
        });
    }

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            userToAdd
        );

    if (!playerInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("otherUserDoesntHaveCoinsInfo")
            ),
        });
    }

    const result: OperationResult = await playerInfo.incrementCoins(addAmount, language);

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("addCoinFailed"),
                result.reason!
            ),
        });
    }

    interaction.editReply(
        MessageCreator.createAccept(
            localization.getTranslation("addCoinSuccess"),
            addAmount.toLocaleString(),
            (playerInfo.alicecoins + addAmount).toLocaleString()
        )
    );
};

export const config: Subcommand["config"] = {
    permissions: ["BOT_OWNER"],
};
