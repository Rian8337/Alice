import { ModalCommand } from "structures/core/ModalCommand";
import { TriviaQuestionCachedAnswer } from "@structures/trivia/TriviaQuestionCachedAnswer";
import { TriviaQuestionsFillInTheBlankLocalization } from "@localization/interactions/modals/Fun/trivia-questions-fillintheblank/TriviaQuestionsFillInTheBlankLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { CacheManager } from "@utils/managers/CacheManager";
import { Collection, Snowflake } from "discord.js";

export const run: ModalCommand["run"] = async (_, interaction) => {
    const localization: TriviaQuestionsFillInTheBlankLocalization =
        new TriviaQuestionsFillInTheBlankLocalization(
            CommandHelper.getLocale(interaction),
        );

    const collection:
        | Collection<Snowflake, TriviaQuestionCachedAnswer>
        | undefined = CacheManager.questionTriviaFillInTheBlankAnswers.get(
        interaction.channelId!,
    );

    if (!collection) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noOngoingQuestionInChannel"),
            ),
        });
    }

    collection.set(interaction.user.id, {
        user: interaction.user,
        answer: interaction.fields.getTextInputValue("answer"),
        submissionTime: interaction.createdTimestamp,
    });

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("answerRecorded"),
        ),
    });
};

export const config: ModalCommand["config"] = {
    replyEphemeral: true,
};
