import { Translation } from "@alice-localization/base/Translation";
import { TriviaMapAnswerStrings } from "../TriviaMapAnswerLocalization";

/**
 * The Korean translation for the `trivia-map-answer` modal command.
 */
export class TriviaMapAnswerKRTranslation extends Translation<TriviaMapAnswerStrings> {
    override readonly translations: TriviaMapAnswerStrings = {
        noOngoingTrivia: "",
        answerRecorded: "",
    };
}
