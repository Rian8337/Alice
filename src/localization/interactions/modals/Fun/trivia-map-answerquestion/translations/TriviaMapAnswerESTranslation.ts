import { Translation } from "@alice-localization/base/Translation";
import { TriviaMapAnswerStrings } from "../TriviaMapAnswerLocalization";

/**
 * The Spanish translation for the `trivia-map-answer` modal command.
 */
export class TriviaMapAnswerESTranslation extends Translation<TriviaMapAnswerStrings> {
    override readonly translations: TriviaMapAnswerStrings = {
        noOngoingTrivia: "",
        answerRecorded: "",
    };
}
