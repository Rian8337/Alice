import { DatabaseManager } from "@alice-database/DatabaseManager";
import { VoteChoice } from "@alice-interfaces/commands/Tools/VoteChoice";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { voteStrings } from "../voteStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const topic: string = interaction.options.getString("topic", true);

    const choices: VoteChoice[] = interaction.options
        .getString("input", true)
        .split("|")
        .map((v) => {
            return {
                choice: v.trim(),
                voters: [],
            };
        });

    if (choices.length <= 1) {
        return interaction.editReply({
            content: MessageCreator.createReject(voteStrings.tooFewChoices),
        });
    }

    await DatabaseManager.aliceDb.collections.voting.insert({
        initiator: interaction.user.id,
        channel: interaction.channel!.id,
        topic: topic,
        choices: choices,
    });

    let string: string = `**Topic: ${topic}**\n\n`;

    for (let i = 0; i < choices.length; ++i) {
        const choice: VoteChoice = choices[i];

        string += `\`[${i + 1}] ${choice.choice} - ${
            choice.voters.length
        }\`\n\n`;
    }

    interaction.editReply({
        content:
            MessageCreator.createAccept(voteStrings.voteStartSuccess) +
            `\n${string}`,
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
