import { DatabaseManager } from "@database/DatabaseManager";
import { Voting } from "@database/utils/aliceDb/Voting";
import { VoteChoice } from "structures/interactions/commands/Tools/VoteChoice";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { VoteLocalization } from "@localization/interactions/commands/Tools/vote/VoteLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { bold } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: VoteLocalization = new VoteLocalization(
        CommandHelper.getLocale(interaction),
    );

    const voteInfo: Voting | null =
        await DatabaseManager.aliceDb.collections.voting.getCurrentVoteInChannel(
            interaction.channelId,
        );

    if (!voteInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noOngoingVoteInChannel"),
            ),
        });
    }

    let string: string = `${bold(
        `${localization.getTranslation("topic")}: ${voteInfo.topic}`,
    )}\n\n`;

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
