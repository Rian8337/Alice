import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { CacheManager } from "@alice-utils/managers/CacheManager";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const player = CacheManager.anniversaryTriviaPlayers.get(
        interaction.user.id,
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

    await InteractionHelper.deferUpdate(interaction);

    await DatabaseManager.aliceDb.collections.anniversaryTriviaPlayer.updateOne(
        { discordId: interaction.user.id },
        {
            $set: {
                "currentAttempt.answers.$[answerFilter].flagged":
                    attemptAnswer.flagged,
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
