import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Challenge } from "@alice-database/utils/aliceDb/Challenge";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { ChallengeType } from "@alice-types/challenge/ChallengeType";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { dailyStrings } from "../dailyStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const type: ChallengeType =
        <ChallengeType>interaction.options.getString("type") ?? "daily";

    const challenge: Challenge | null =
        await DatabaseManager.aliceDb.collections.challenge.getOngoingChallenge(
            type
        );

    if (!challenge) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                dailyStrings.noOngoingChallenge
            ),
        });
    }

    interaction.editReply(
        await EmbedCreator.createChallengeEmbed(
            challenge,
            challenge.type === "weekly" ? "#af46db" : "#e3b32d"
        )
    );
};

export const config: Subcommand["config"] = {
    permissions: [],
};
