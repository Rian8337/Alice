import { Translation } from "@alice-localization/base/Translation";
import { TriviaMapAnswerStrings } from "../TriviaMapAnswerLocalization";

/**
 * The English translation for the `trivia-map-answer` modal command.
 */
export class TriviaMapAnswerENTranslation extends Translation<TriviaMapAnswerStrings> {
    override readonly translations: TriviaMapAnswerStrings = {
        noOngoingTrivia:
            "I'm sorry, there is no ongoing map trivia in the channel right now!",
        answerRecorded: "Your answer has been recorded!",
    };
}
