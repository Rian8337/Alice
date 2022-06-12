import { Translation } from "@alice-localization/base/Translation";
import { TriviaQuestionsFillInTheBlankStrings } from "../TriviaQuestionsFillInTheBlankLocalization";

/**
 * The Spanish translation for the `trivia-questions-fillintheblank` modal command.
 */
export class TriviaQuestionsFillInTheBlankESTranslation extends Translation<TriviaQuestionsFillInTheBlankStrings> {
    override readonly translations: TriviaQuestionsFillInTheBlankStrings = {
        noOngoingQuestionInChannel: "",
        answerRecorded: "",
    };
}
