import { User } from "discord.js";
import { DatabaseManager } from "@database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { Constants } from "@core/Constants";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { NumberHelper } from "@utils/helpers/NumberHelper";
import { PlayerInfo } from "@database/utils/aliceDb/PlayerInfo";
import { OperationResult } from "structures/core/OperationResult";
import { CoinsLocalization } from "@localization/interactions/commands/Fun/coins/CoinsLocalization";
import { ConstantsLocalization } from "@localization/core/constants/ConstantsLocalization";
import { LocaleHelper } from "@utils/helpers/LocaleHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: CoinsLocalization = new CoinsLocalization(
        CommandHelper.getLocale(interaction),
    );

    if (!CommandHelper.isExecutedByBotOwner(interaction)) {
        const constantsLocalization: ConstantsLocalization =
            new ConstantsLocalization(localization.language);

        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                constantsLocalization.getTranslation(
                    Constants.noPermissionReject,
                ),
            ),
        });
    }

    const userToAdd: User = interaction.options.getUser("user", true);

    const addAmount: number = interaction.options.getInteger("amount", true);

    if (!NumberHelper.isPositive(addAmount)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("addAmountInvalid"),
            ),
        });
    }

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            userToAdd,
            {
                projection: {
                    _id: 0,
                    coins: 1,
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
        addAmount,
        localization.language,
    );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("addCoinFailed"),
                result.reason!,
            ),
        });
    }

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("addCoinSuccess"),
            addAmount.toLocaleString(BCP47),
            (playerInfo.coins + addAmount).toLocaleString(BCP47),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["BotOwner"],
};
