import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Voting } from "@alice-database/utils/aliceDb/Voting";
import { VoteChoice } from "@alice-interfaces/commands/Tools/VoteChoice";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { VoteLocalization } from "@alice-localization/commands/Tools/vote/VoteLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const localization: VoteLocalization = new VoteLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const voteInfo: Voting | null =
        await DatabaseManager.aliceDb.collections.voting.getCurrentVoteInChannel(
            interaction.channel!.id
        );

    if (!voteInfo) {
        return InteractionHelper.reply(interaction, {
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
        return InteractionHelper.reply(interaction, {
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

    InteractionHelper.reply(interaction, {
        content:
            MessageCreator.createAccept(
                localization.getTranslation("voteCancelled"),
                interaction.user.toString()
            ) + `\n${string}`,
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
