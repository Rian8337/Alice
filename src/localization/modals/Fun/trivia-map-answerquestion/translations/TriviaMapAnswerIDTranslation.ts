import { Translation } from "@alice-localization/base/Translation";
import { TriviaMapAnswerStrings } from "../TriviaMapAnswerLocalization";

/**
 * The Indonesian translation for the `trivia-map-answer` modal command.
 */
export class TriviaMapAnswerIDTranslation extends Translation<TriviaMapAnswerStrings> {
    override readonly translations: TriviaMapAnswerStrings = {
        noOngoingTrivia: "",
        answerRecorded: "",
    };
}
