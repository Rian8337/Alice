import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { Constants } from "@alice-core/Constants";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { coinsStrings } from "../coinsStrings";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";

export const run: Subcommand["run"] = async (_, interaction) => {
    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            interaction.user
        );

    if (playerInfo) {
        let dailyCoin: number = 50;
        const streak: number = playerInfo.streak + 1;
        const streakComplete: boolean = streak === 5;

        if (streakComplete) {
            dailyCoin += 100;
        }

        const result: OperationResult = await playerInfo.claimDailyCoins(
            dailyCoin
        );

        if (!result.success) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    coinsStrings.dailyClaimFailed,
                    <string>result.reason
                ),
            });
        }

        interaction.editReply({
            content: MessageCreator.createAccept(
                coinsStrings.dailyClaimSuccess,
                streakComplete ? "completed a streak and " : "",
                dailyCoin.toLocaleString(),
                streak.toString(),
                (playerInfo.alicecoins + dailyCoin).toLocaleString()
            ),
        });
    } else {
        const bindInfo: UserBind | null =
            await DatabaseManager.elainaDb.collections.userBind.getOne({
                discordid: interaction.user.id,
            });

        if (!bindInfo) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    Constants.selfNotBindedReject
                ),
            });
        }

        const result: OperationResult =
            await DatabaseManager.aliceDb.collections.playerInfo.insert({
                username: bindInfo.username,
                uid: bindInfo.uid,
                discordid: interaction.user.id,
                hasClaimedDaily: true,
                alicecoins: 50,
                streak: 1,
            });

        if (!result.success) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    coinsStrings.dailyClaimFailed,
                    result.reason!
                ),
            });
        }

        interaction.editReply({
            content: MessageCreator.createAccept(
                coinsStrings.dailyClaimSuccess,
                "",
                "50",
                "1",
                "50"
            ),
        });
    }
};

export const config: Subcommand["config"] = {
    permissions: [],
};
