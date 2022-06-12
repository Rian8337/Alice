import { Translation } from "@alice-localization/base/Translation";
import { TriviaQuestionsFillInTheBlankStrings } from "../TriviaQuestionsFillInTheBlankLocalization";

/**
 * The Korean translation for the `trivia-questions-fillintheblank` modal command.
 */
export class TriviaQuestionsFillInTheBlankKRTranslation extends Translation<TriviaQuestionsFillInTheBlankStrings> {
    override readonly translations: TriviaQuestionsFillInTheBlankStrings = {
        noOngoingQuestionInChannel: "",
        answerRecorded: "",
    };
}
