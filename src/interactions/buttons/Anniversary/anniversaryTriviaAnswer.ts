import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { AnniversaryTriviaCurrentAttemptQuestion } from "@alice-structures/utils/AnniversaryTriviaCurrentAttemptQuestion";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { CacheManager } from "@alice-utils/managers/CacheManager";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    await InteractionHelper.deferUpdate(interaction);

    const player =
        await DatabaseManager.aliceDb.collections.anniversaryTriviaPlayer.getFromId(
            interaction.user.id,
            { projection: { _id: 0, currentAttempt: 1 } },
        );

    if (!player?.currentAttempt) {
        return;
    }

    const split = interaction.customId.split("#");
    const questionId = parseInt(split[1]);
    const answer = split[2];

    const existingAnswer = player.currentAttempt.find(
        (v) => v.id === questionId,
    );

    if (existingAnswer) {
        existingAnswer.answer = answer;

        await DatabaseManager.aliceDb.collections.anniversaryTriviaPlayer.updateOne(
            { discordId: interaction.user.id },
            {
                $set: {
                    "currentAttempt.$[answerFilter].answer": answer,
                },
            },
            {
                arrayFilters: [{ "answerFilter.id": questionId }],
            },
        );
    } else {
        const attemptAnswer: AnniversaryTriviaCurrentAttemptQuestion = {
            id: questionId,
            answer: answer,
            flagged: false,
        };

        player.currentAttempt.push(attemptAnswer);

        await DatabaseManager.aliceDb.collections.anniversaryTriviaPlayer.updateOne(
            { discordId: interaction.user.id },
            { $push: { currentAttempt: attemptAnswer } },
        );
    }

    InteractionHelper.update(
        interaction,
        player.toAttemptMessage(
            interaction.member,
            CacheManager.anniversaryTriviaQuestions.get(questionId)!,
            CommandHelper.getLocale(interaction),
        ),
    );
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
    instantDeferInDebug: false,
};
