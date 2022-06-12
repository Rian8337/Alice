import { GuildMember, Permissions, TextChannel } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { VoteChoice } from "@alice-interfaces/commands/Tools/VoteChoice";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Voting } from "@alice-database/utils/aliceDb/Voting";
import { VoteLocalization } from "@alice-localization/commands/Tools/vote/VoteLocalization";
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

    // People with manage channels permission can end vote
    if (
        interaction.user.id !== voteInfo.initiator &&
        !(<TextChannel>interaction.channel)
            .permissionsFor(<GuildMember>interaction.member)
            ?.any(Permissions.FLAGS.MANAGE_CHANNELS)
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noEndVotePermission")
            ),
        });
    }

    await voteInfo.end();

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
                localization.getTranslation("endVoteSuccess")
            ) + `\n${string}`,
    });
};
