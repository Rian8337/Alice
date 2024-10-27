import { DatabaseManager } from "@database/DatabaseManager";
import { ButtonCommand } from "@structures/core/ButtonCommand";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { CacheManager } from "@utils/managers/CacheManager";

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
    const attemptAnswer = player.currentAttempt.find(
        (v) => v.id === questionId,
    );

    if (!attemptAnswer) {
        return;
    }

    attemptAnswer.flagged = !attemptAnswer.flagged;

    await DatabaseManager.aliceDb.collections.anniversaryTriviaPlayer.updateOne(
        { discordId: interaction.user.id },
        {
            $set: {
                "currentAttempt.$[answerFilter].flagged": attemptAnswer.flagged,
            },
        },
        {
            arrayFilters: [{ "answerFilter.id": questionId }],
        },
    );

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
