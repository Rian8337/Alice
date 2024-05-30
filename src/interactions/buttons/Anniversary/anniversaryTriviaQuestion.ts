import { DatabaseManager } from "@alice-database/DatabaseManager";
import { AnniversaryReviewType } from "@alice-enums/utils/AnniversaryReviewType";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
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
        );

    if (!player) {
        return;
    }

    const split = interaction.customId.split("#");
    const questionId = parseInt(split[1]);
    const type = (split[2] as AnniversaryReviewType) || undefined;
    const attemptIndex = split[3] ? parseInt(split[3]) : undefined;

    const question = CacheManager.anniversaryTriviaQuestions.get(questionId)!;
    const language = CommandHelper.getLocale(interaction);

    InteractionHelper.update(
        interaction,
        attemptIndex === undefined || type === undefined
            ? player.toAttemptMessage(interaction.member, question, language)
            : player.toReviewMessage(
                  interaction.member,
                  question,
                  attemptIndex,
                  language,
                  type,
              ),
    );
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
    instantDeferInDebug: false,
};
