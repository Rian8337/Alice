import { User } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { Constants } from "@alice-core/Constants";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { CoinsLocalization } from "@alice-localization/commands/Fun/coins/CoinsLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: CoinsLocalization = new CoinsLocalization(
        await CommandHelper.getLocale(interaction)
    );

    if (!CommandHelper.isExecutedByBotOwner(interaction)) {
        const constantsLocalization: ConstantsLocalization =
            new ConstantsLocalization(localization.language);

        return interaction.editReply({
            content: MessageCreator.createReject(
                constantsLocalization.getTranslation(
                    Constants.noPermissionReject
                )
            ),
        });
    }

    const userToAdd: User = interaction.options.getUser("user", true);

    const addAmount: number = interaction.options.getInteger("amount", true);

    if (!NumberHelper.isPositive(addAmount)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("addAmountInvalid")
            ),
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

    const result: OperationResult = await playerInfo.incrementCoins(
        addAmount,
        localization.language
    );

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
            addAmount.toLocaleString(
                LocaleHelper.convertToBCP47(localization.language)
            ),
            (playerInfo.alicecoins + addAmount).toLocaleString(
                LocaleHelper.convertToBCP47(localization.language)
            )
        )
    );
};

export const config: Subcommand["config"] = {
    permissions: ["BOT_OWNER"],
};
