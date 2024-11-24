import { DatabaseManager } from "@database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { Constants } from "@core/Constants";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { PlayerInfo } from "@database/utils/aliceDb/PlayerInfo";
import { OperationResult } from "structures/core/OperationResult";
import { UserBind } from "@database/utils/elainaDb/UserBind";
import { CoinsLocalization } from "@localization/interactions/commands/Fun/coins/CoinsLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { ConstantsLocalization } from "@localization/core/constants/ConstantsLocalization";
import { LocaleHelper } from "@utils/helpers/LocaleHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: CoinsLocalization = new CoinsLocalization(
        CommandHelper.getLocale(interaction),
    );

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            interaction.user,
            {
                projection: {
                    _id: 0,
                    streak: 1,
                    coins: 1,
                    hasClaimedDaily: 1,
                },
            },
        );

    if (playerInfo) {
        let dailyCoin: number = 50;
        const streak: number = playerInfo.streak + 1;
        const streakComplete: boolean = streak === 5;

        if (streakComplete) {
            dailyCoin += 100;
        }

        const result: OperationResult = await playerInfo.claimDailyCoins(
            dailyCoin,
            localization.language,
        );

        if (!result.success) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("dailyClaimFailed"),
                    result.reason!,
                ),
            });
        }

        const BCP47: string = LocaleHelper.convertToBCP47(
            localization.language,
        );

        InteractionHelper.reply(interaction, {
            content: MessageCreator.createAccept(
                localization.getTranslation(
                    streakComplete
                        ? "dailyClaimWithStreakSuccess"
                        : "dailyClaimSuccess",
                ),
                dailyCoin.toLocaleString(BCP47),
                streak.toString(),
                (playerInfo.coins + dailyCoin).toLocaleString(BCP47),
            ),
        });
    } else {
        const bindInfo: UserBind | null =
            await DatabaseManager.elainaDb.collections.userBind.getFromUser(
                interaction.user,
                {
                    projection: {
                        _id: 0,
                        uid: 1,
                        username: 1,
                    },
                },
            );

        if (!bindInfo) {
            const constantsLocalization: ConstantsLocalization =
                new ConstantsLocalization(localization.language);

            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    constantsLocalization.getTranslation(
                        Constants.selfNotBindedReject,
                    ),
                ),
            });
        }

        const result: OperationResult =
            await DatabaseManager.aliceDb.collections.playerInfo.insert({
                username: bindInfo.username,
                uid: bindInfo.uid,
                discordid: interaction.user.id,
                hasClaimedDaily: true,
                coins: 50,
                streak: 1,
            });

        if (!result.success) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("dailyClaimFailed"),
                    result.reason!,
                ),
            });
        }

        InteractionHelper.reply(interaction, {
            content: MessageCreator.createAccept(
                localization.getTranslation("dailyClaimSuccess"),
                "50",
                "1",
                "50",
            ),
        });
    }
};
