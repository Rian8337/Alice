import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Voting } from "@alice-database/utils/aliceDb/Voting";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { VoteLocalization } from "@alice-localization/interactions/commands/Tools/vote/VoteLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: VoteLocalization = new VoteLocalization(
        CommandHelper.getLocale(interaction),
    );

    const voteInfo: Voting | null =
        await DatabaseManager.aliceDb.collections.voting.getCurrentVoteInChannel(
            interaction.channelId,
            {
                projection: {
                    choices: {
                        $elemMatch: {
                            voters: interaction.user.id,
                        },
                    },
                },
            },
        );

    if (!voteInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noOngoingVoteInChannel"),
            ),
        });
    }

    if (!voteInfo.choices[0]) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("notVotedYet"),
            ),
        });
    }

    await DatabaseManager.aliceDb.collections.voting.updateOne(
        { channel: interaction.channelId },
        {
            $pull: {
                "choices.$[choiceFilter].voters": interaction.user.id,
            },
        },
        {
            arrayFilters: [
                { "choiceFilter.choice": voteInfo.choices[0].choice },
            ],
        },
    );

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("voteCancelled"),
            interaction.user.toString(),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
