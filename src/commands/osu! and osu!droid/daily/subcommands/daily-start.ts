import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Challenge } from "@alice-database/utils/aliceDb/Challenge";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { dailyStrings } from "../dailyStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const id: string = interaction.options.getString("challengeid", true);

    const challenge: Challenge | null =
        await DatabaseManager.aliceDb.collections.challenge.getById(id);

    if (!challenge) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                dailyStrings.challengeNotFound
            ),
        });
    }

    const result: OperationResult = await challenge.start();

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                dailyStrings.startChallengeFailed,
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            dailyStrings.startChallengeSuccess,
            id
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["BOT_OWNER"],
};
