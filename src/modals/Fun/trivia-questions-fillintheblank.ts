import { ModalCommand } from "@alice-interfaces/core/ModalCommand";
import { TriviaCachedAnswer } from "@alice-interfaces/trivia/TriviaCachedAnswer";
import { TriviaQuestionsFillInTheBlankLocalization } from "@alice-localization/modals/Fun/trivia-questions-fillintheblank/TriviaQuestionsFillInTheBlankLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { CacheManager } from "@alice-utils/managers/CacheManager";
import { Collection, Snowflake } from "discord.js";

export const run: ModalCommand["run"] = async (_, interaction) => {
    const localization: TriviaQuestionsFillInTheBlankLocalization =
        new TriviaQuestionsFillInTheBlankLocalization(
            await CommandHelper.getLocale(interaction)
        );

    const collection: Collection<Snowflake, TriviaCachedAnswer> | undefined =
        CacheManager.mapTriviaFillInTheBlankAnswers.get(interaction.channelId!);

    if (!collection) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noOngoingQuestionInChannel")
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
            localization.getTranslation("answerRecorded")
        ),
    });
};

export const config: ModalCommand["config"] = {
    replyEphemeral: true,
};
