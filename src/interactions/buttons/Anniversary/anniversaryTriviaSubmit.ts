import { DatabaseManager } from "@alice-database/DatabaseManager";
import { AnniversaryTriviaSubmitLocalization } from "@alice-localization/interactions/buttons/Anniversary/anniversaryTriviaSubmit/AnniversaryTriviaSubmitLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { AnniversaryTriviaManager } from "@alice-utils/managers/AnniversaryTriviaManager";
import { CacheManager } from "@alice-utils/managers/CacheManager";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const localization = new AnniversaryTriviaSubmitLocalization(
        CommandHelper.getLocale(interaction),
    );

    const player = CacheManager.anniversaryTriviaPlayers.get(
        interaction.user.id,
    );

    if (!player?.currentAttempt) {
        return;
    }

    await InteractionHelper.deferReply(interaction);

    const confirmation = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("confirmSubmission"),
            ),
        },
        [interaction.user.id],
        15,
        localization.language,
    );

    if (!confirmation) {
        return;
    }

    player.pastAttempts.push({
        answers: player.currentAttempt.map((v) => {
            return {
                id: v.id,
                answer: v.answer,
            };
        }),
        marks: CacheManager.anniversaryTriviaQuestions.reduce((a, v) => {
            const answer = player.currentAttempt?.find((t) => t.id === v.id);

            return a + (answer?.answer === v.correctAnswer ? v.marks : 0);
        }, 0),
        submissionDate: interaction.createdAt,
    });

    player.currentAttempt = undefined;

    await InteractionHelper.deferUpdate(interaction);

    await DatabaseManager.aliceDb.collections.anniversaryTriviaPlayer.updateOne(
        { discordId: interaction.user.id },
        {
            $unset: { currentAttempt: "" },
            $push: { pastAttempts: player.pastAttempts.at(-1) },
        },
    );

    InteractionHelper.update(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("submissionSuccess"),
            player.pastAttempts.at(-1)!.marks.toString(),
            AnniversaryTriviaManager.maximumMarks.toString(),
        ),
    });
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
    instantDeferInDebug: false,
};
