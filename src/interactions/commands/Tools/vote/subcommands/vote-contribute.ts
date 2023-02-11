import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Voting } from "@alice-database/utils/aliceDb/Voting";
import { VoteChoice } from "structures/interactions/commands/Tools/VoteChoice";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { VoteLocalization } from "@alice-localization/interactions/commands/Tools/vote/VoteLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { RESTManager } from "@alice-utils/managers/RESTManager";
import { UpdateFilter } from "mongodb";
import { DatabaseVoting } from "structures/database/aliceDb/DatabaseVoting";
import { bold } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: VoteLocalization = new VoteLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const voteInfo: Voting | null =
        await DatabaseManager.aliceDb.collections.voting.getCurrentVoteInChannel(
            interaction.channelId
        );

    if (!voteInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noOngoingVoteInChannel")
            ),
        });
    }

    const { choices } = voteInfo;

    const pickedChoice: number =
        interaction.options.getInteger("option", true) - 1;

    if (
        !NumberHelper.isNumberInRange(
            pickedChoice,
            0,
            voteInfo.choices.length - 1,
            true
        )
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("invalidVoteChoice")
            ),
        });
    }

    // Check if the user has already voted, in that case
    // we want to move the choice to the one that is picked
    // in this command execution
    const choiceIndex: number = choices.findIndex((c) =>
        c.voters.includes(interaction.user.id)
    );

    if (pickedChoice === choiceIndex) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("voteChoiceIsSameAsBefore")
            ),
        });
    }

    if (voteInfo.xpReq) {
        const userXP: number | null = await RESTManager.getUserTatsuXP(
            interaction.guildId!,
            interaction.user.id
        );

        if (userXP === null) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("cannotRetrieveTatsuXP")
                ),
            });
        }

        if (userXP < voteInfo.xpReq) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("tatsuXPTooSmall")
                ),
            });
        }
    }

    const query: UpdateFilter<DatabaseVoting> = {
        $push: {},
    };

    Object.defineProperty(query.$push, `choices.${pickedChoice}.voters`, {
        value: interaction.user.id,
        configurable: true,
        enumerable: true,
        writable: true,
    });

    if (choiceIndex !== -1) {
        choices[choiceIndex].voters.splice(
            choices[choiceIndex].voters.indexOf(interaction.user.id),
            1
        );

        query.$pull = {};

        Object.defineProperty(query.$pull, `choices.${choiceIndex}.voters`, {
            value: interaction.user.id,
            configurable: true,
            enumerable: true,
            writable: true,
        });
    }

    choices[pickedChoice].voters.push(interaction.user.id);

    await DatabaseManager.aliceDb.collections.voting.updateOne(
        { channel: interaction.channelId },
        query
    );

    let string: string = `${bold(
        `${localization.getTranslation("topic")}: ${voteInfo.topic}`
    )}\n\n`;

    for (let i = 0; i < voteInfo.choices.length; ++i) {
        const choice: VoteChoice = voteInfo.choices[i];

        string += `\`[${i + 1}] ${choice.choice} - ${
            choice.voters.length
        }\`\n\n`;
    }

    if (choiceIndex === -1) {
        InteractionHelper.reply(interaction, {
            content:
                MessageCreator.createAccept(
                    localization.getTranslation("voteRegistered"),
                    interaction.user.toString()
                ) + `\n${string}`,
        });
    } else {
        InteractionHelper.reply(interaction, {
            content:
                MessageCreator.createAccept(
                    localization.getTranslation("voteMoved"),
                    interaction.user.toString(),
                    (choiceIndex + 1).toString(),
                    (pickedChoice + 1).toString()
                ) + `\n${string}`,
        });
    }
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
    replyEphemeral: true,
};
