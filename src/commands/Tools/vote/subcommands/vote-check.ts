import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Voting } from "@alice-database/utils/aliceDb/Voting";
import { VoteChoice } from "@alice-interfaces/commands/Tools/VoteChoice";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { voteStrings } from "../voteStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const voteInfo: Voting | null =
        await DatabaseManager.aliceDb.collections.voting.getCurrentVoteInChannel(
            interaction.channel!.id
        );

    if (!voteInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                voteStrings.noOngoingVoteInChannel
            ),
        });
    }

    let string: string = `**Topic: ${voteInfo.topic}**\n\n`;

    const choiceArray: VoteChoice[] = [...voteInfo.choices.values()];

    for (let i = 0; i < choiceArray.length; ++i) {
        const choice: VoteChoice = choiceArray[i];

        string += `\`[${i + 1}] ${choice.choice} - ${
            choice.voters.length
        }\`\n\n`;
    }

    interaction.editReply({
        content: string,
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
