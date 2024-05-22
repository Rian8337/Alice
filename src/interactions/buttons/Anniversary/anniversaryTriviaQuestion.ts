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

    if (!player) {
        return;
    }

    const split = interaction.customId.split("#");
    const questionId = parseInt(split[1]);
    const attemptIndex = split[2] ? parseInt(split[2]) : undefined;

    if (attemptIndex !== undefined && player.currentAttempt === undefined) {
        return;
    }

    const question = CacheManager.anniversaryTriviaQuestions.get(questionId)!;
    const language = CommandHelper.getLocale(interaction);

    InteractionHelper.update(
        interaction,
        attemptIndex === undefined
            ? player.toAttemptMessage(interaction.member, question, language)
            : player.toReviewMessage(
                  interaction.member,
                  question,
                  attemptIndex,
                  language,
              ),
    );
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
    instantDeferInDebug: false,
};
