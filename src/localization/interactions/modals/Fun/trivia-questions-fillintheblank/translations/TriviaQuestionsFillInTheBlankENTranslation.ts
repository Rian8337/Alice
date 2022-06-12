import { Translation } from "@alice-localization/base/Translation";
import { TriviaQuestionsFillInTheBlankStrings } from "../TriviaQuestionsFillInTheBlankLocalization";

/**
 * The English translation for the `trivia-questions-fillintheblank` modal command.
 */
export class TriviaQuestionsFillInTheBlankENTranslation extends Translation<TriviaQuestionsFillInTheBlankStrings> {
    override readonly translations: TriviaQuestionsFillInTheBlankStrings = {
        noOngoingQuestionInChannel:
            "I'm sorry, there is no ongoing trivia question in this channel!",
        answerRecorded: "Your answer has been recorded!",
    };
}
