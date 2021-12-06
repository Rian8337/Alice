import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Voting } from "@alice-database/utils/aliceDb/Voting";
import { VoteChoice } from "@alice-interfaces/commands/Tools/VoteChoice";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
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

    const choices: VoteChoice[] = voteInfo.choices;

    const pickedChoice: number = interaction.options.getInteger("option")! - 1;

    if (!NumberHelper.isNumberInRange(pickedChoice, 0, voteInfo.choices.length - 1, true)) {
        return interaction.editReply({
            content: MessageCreator.createReject(voteStrings.invalidVoteChoice)
        });
    }

    // Check if the user has already voted, in that case
    // we want to move the choice to the one that is picked
    // in this command execution
    const choiceIndex: number = choices.findIndex((c) =>
        c.voters.includes(interaction.user.id)
    );

    if (pickedChoice === choiceIndex) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                voteStrings.voteChoiceIsSameAsBefore
            ),
        });
    }

    if (choiceIndex !== -1) {
        choices[choiceIndex].voters.splice(
            choices[choiceIndex].voters.indexOf(interaction.user.id),
            1
        );
    }

    choices[pickedChoice].voters.push(interaction.user.id);

    await DatabaseManager.aliceDb.collections.voting.update(
        { channel: interaction.channel!.id },
        { $set: { choices: choices } }
    );

    let string: string = `**Topic: ${voteInfo.topic}**\n\n`;

    for (let i = 0; i < voteInfo.choices.length; ++i) {
        const choice: VoteChoice = voteInfo.choices[i];

        string += `\`[${i + 1}] ${choice.choice} - ${choice.voters.length
            }\`\n\n`;
    }

    interaction.editReply({
        content:
            MessageCreator.createAccept(
                voteStrings.voteRegistered,
                interaction.user.toString(),
                choiceIndex === -1
                    ? "your vote has been registered"
                    : `your vote has been moved from option \`${choiceIndex + 1
                    }\` to \`${pickedChoice + 1}\``
            ) + `\n${string}`,
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
