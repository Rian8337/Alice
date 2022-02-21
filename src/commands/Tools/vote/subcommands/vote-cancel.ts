import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Voting } from "@alice-database/utils/aliceDb/Voting";
import { VoteChoice } from "@alice-interfaces/commands/Tools/VoteChoice";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { VoteLocalization } from "@alice-localization/commands/Tools/VoteLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: VoteLocalization = new VoteLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const voteInfo: Voting | null =
        await DatabaseManager.aliceDb.collections.voting.getCurrentVoteInChannel(
            interaction.channel!.id
        );

    if (!voteInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("noOngoingVoteInChannel")
            ),
        });
    }

    const choices: VoteChoice[] = voteInfo.choices;

    // Check if the user has already voted
    const choiceIndex: number = choices.findIndex((c) =>
        c.voters.includes(interaction.user.id)
    );

    if (choiceIndex === -1) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("notVotedYet")
            ),
        });
    }

    choices[choiceIndex].voters.splice(
        choices[choiceIndex].voters.indexOf(interaction.user.id),
        1
    );

    await DatabaseManager.aliceDb.collections.voting.update(
        { channel: interaction.channel!.id },
        { $set: { choices: choices } }
    );

    let string: string = `**${localization.getTranslation("topic")}: ${
        voteInfo.topic
    }**\n\n`;

    for (let i = 0; i < voteInfo.choices.length; ++i) {
        const choice: VoteChoice = voteInfo.choices[i];

        string += `\`[${i + 1}] ${choice.choice} - ${
            choice.voters.length
        }\`\n\n`;
    }

    interaction.editReply({
        content:
            MessageCreator.createAccept(
                localization.getTranslation("voteCancelled"),
                interaction.user.toString()
            ) + `\n${string}`,
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
