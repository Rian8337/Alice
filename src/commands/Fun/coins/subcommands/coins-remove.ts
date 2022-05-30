import { User } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { CoinsLocalization } from "@alice-localization/commands/Fun/coins/CoinsLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const localization: CoinsLocalization = new CoinsLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const userToRemove: User = interaction.options.getUser("user", true);

    const removeAmount: number = interaction.options.getInteger("amount", true);

    if (!NumberHelper.isPositive(removeAmount)) {
        return InteractionHelper.reply(interaction, {
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
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("otherUserDoesntHaveCoinsInfo")
            ),
        });
    }

    const result: OperationResult = await playerInfo.incrementCoins(
        -removeAmount,
        localization.language
    );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("removeCoinFailed"),
                result.reason!
            ),
        });
    }

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("removeCoinSuccess"),
            removeAmount.toLocaleString(BCP47),
            (playerInfo.alicecoins - removeAmount).toLocaleString(BCP47)
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["BOT_OWNER"],
};
