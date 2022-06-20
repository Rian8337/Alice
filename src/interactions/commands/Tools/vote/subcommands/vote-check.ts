import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Voting } from "@alice-database/utils/aliceDb/Voting";
import { VoteChoice } from "@alice-interfaces/interactions/commands/Tools/VoteChoice";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { VoteLocalization } from "@alice-localization/interactions/commands/Tools/vote/VoteLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
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

    let string: string = `**${localization.getTranslation("topic")}: ${
        voteInfo.topic
    }**\n\n`;

    const choiceArray: VoteChoice[] = [...voteInfo.choices.values()];

    for (let i = 0; i < choiceArray.length; ++i) {
        const choice: VoteChoice = choiceArray[i];

        string += `\`[${i + 1}] ${choice.choice} - ${
            choice.voters.length
        }\`\n\n`;
    }

    InteractionHelper.reply(interaction, {
        content: string,
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
