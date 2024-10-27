import { User } from "discord.js";
import { DatabaseManager } from "@database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { NumberHelper } from "@utils/helpers/NumberHelper";
import { PlayerInfo } from "@database/utils/aliceDb/PlayerInfo";
import { OperationResult } from "structures/core/OperationResult";
import { CoinsLocalization } from "@localization/interactions/commands/Fun/coins/CoinsLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { LocaleHelper } from "@utils/helpers/LocaleHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: CoinsLocalization = new CoinsLocalization(
        CommandHelper.getLocale(interaction),
    );

    const userToRemove: User = interaction.options.getUser("user", true);

    const removeAmount: number = interaction.options.getInteger("amount", true);

    if (!NumberHelper.isPositive(removeAmount)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("removeAmountInvalid"),
            ),
        });
    }

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            userToRemove,
            {
                projection: {
                    _id: 0,
                    alicecoins: 1,
                },
            },
        );

    if (!playerInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("otherUserDoesntHaveCoinsInfo"),
            ),
        });
    }

    const result: OperationResult = await playerInfo.incrementCoins(
        -removeAmount,
        localization.language,
    );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("removeCoinFailed"),
                result.reason!,
            ),
        });
    }

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("removeCoinSuccess"),
            removeAmount.toLocaleString(BCP47),
            (playerInfo.alicecoins - removeAmount).toLocaleString(BCP47),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["BotOwner"],
};
