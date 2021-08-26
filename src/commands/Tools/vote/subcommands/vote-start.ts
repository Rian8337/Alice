import { DatabaseManager } from "@alice-database/DatabaseManager";
import { VoteChoice } from "@alice-interfaces/commands/Tools/VoteChoice";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { voteStrings } from "../voteStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const input: string[] = interaction.options.getString("input", true).split("|");

    if (input.length === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(voteStrings.invalidVoteStartInput)
        });
    }

    const topic: string = input.shift()!;

    const choices: VoteChoice[] = input.map(v => {
        return {
            choice: v.trim(),
            voters: []
        };
    });

    if (choices.length <= 1) {
        return interaction.editReply({
            content: MessageCreator.createReject(voteStrings.tooFewChoices)
        });
    }

    await DatabaseManager.aliceDb.collections.voting.insert({
        initiator: interaction.user.id,
        channel: interaction.channel!.id,
        topic: topic,
        choices: choices
    });

    let string: string = `**Topic: ${topic}**\n\n`;

    for (let i = 0; i < choices.length; ++i) {
        const choice: VoteChoice = choices[i];

        string += `\`[${i + 1}] ${choice.choice} - ${choice.voters.length}\`\n\n`;
    }

    interaction.editReply({
        content: MessageCreator.createAccept(voteStrings.voteStartSuccess) + `\n${string}`
    });
};