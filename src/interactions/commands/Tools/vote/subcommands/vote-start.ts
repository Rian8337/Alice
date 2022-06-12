import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Voting } from "@alice-database/utils/aliceDb/Voting";
import { VoteChoice } from "@alice-interfaces/commands/Tools/VoteChoice";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { VoteLocalization } from "@alice-localization/interactions/commands/Tools/vote/VoteLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const localization: VoteLocalization = new VoteLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const xpReq: number | null = interaction.options.getInteger("xpreq");

    if (xpReq && !NumberHelper.isPositive(xpReq)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("invalidXpReq")
            ),
        });
    }

    const topic: string = interaction.options.getString("topic", true);

    const choices: VoteChoice[] = interaction.options
        .getString("choices", true)
        .split("|")
        .map((v) => {
            return {
                choice: v.trim(),
                voters: [],
            };
        });

    if (choices.length <= 1) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("tooFewChoices")
            ),
        });
    }

    const voteInfo: Voting | null =
        await DatabaseManager.aliceDb.collections.voting.getCurrentVoteInChannel(
            interaction.channelId
        );

    if (voteInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("ongoingVoteInChannel")
            ),
        });
    }

    await DatabaseManager.aliceDb.collections.voting.insert({
        initiator: interaction.user.id,
        channel: interaction.channel!.id,
        xpReq: xpReq || undefined,
        topic: topic,
        choices: choices,
    });

    let string: string = `**${localization.getTranslation(
        "topic"
    )}: ${topic}**\n\n`;

    for (let i = 0; i < choices.length; ++i) {
        const choice: VoteChoice = choices[i];

        string += `\`[${i + 1}] ${choice.choice} - ${
            choice.voters.length
        }\`\n\n`;
    }

    InteractionHelper.reply(interaction, {
        content:
            MessageCreator.createAccept(
                localization.getTranslation("voteStartSuccess")
            ) + `\n${string}`,
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
