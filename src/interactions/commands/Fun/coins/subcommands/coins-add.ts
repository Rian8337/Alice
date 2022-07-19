import { User } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { Constants } from "@alice-core/Constants";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { OperationResult } from "structures/core/OperationResult";
import { CoinsLocalization } from "@alice-localization/interactions/commands/Fun/coins/CoinsLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: CoinsLocalization = new CoinsLocalization(
        await CommandHelper.getLocale(interaction)
    );

    if (!CommandHelper.isExecutedByBotOwner(interaction)) {
        const constantsLocalization: ConstantsLocalization =
            new ConstantsLocalization(localization.language);

        return InteractionHelper.reply(interaction, {
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
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("addAmountInvalid")
            ),
        });
    }

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            userToAdd,
            {
                projection: {
                    _id: 0,
                    alicecoins: 1,
                },
            }
        );

    if (!playerInfo) {
        return InteractionHelper.reply(interaction, {
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
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("addCoinFailed"),
                result.reason!
            ),
        });
    }

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("addCoinSuccess"),
            addAmount.toLocaleString(BCP47),
            (playerInfo.alicecoins + addAmount).toLocaleString(BCP47)
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["BotOwner"],
};
