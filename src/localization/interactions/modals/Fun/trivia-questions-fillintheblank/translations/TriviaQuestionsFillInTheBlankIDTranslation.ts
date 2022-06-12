import { Translation } from "@alice-localization/base/Translation";
import { TriviaQuestionsFillInTheBlankStrings } from "../TriviaQuestionsFillInTheBlankLocalization";

/**
 * The Indonesian translation for the `trivia-questions-fillintheblank` modal command.
 */
export class TriviaQuestionsFillInTheBlankIDTranslation extends Translation<TriviaQuestionsFillInTheBlankStrings> {
    override readonly translations: TriviaQuestionsFillInTheBlankStrings = {
        noOngoingQuestionInChannel: "",
        answerRecorded: "",
    };
}
