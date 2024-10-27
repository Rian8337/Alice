import { Translation } from "@localization/base/Translation";
import { TriviaHelperStrings } from "../TriviaHelperLocalization";

/**
 * The English translation for the `TriviaHelper` helper utility.
 */
export class TriviaHelperENTranslation extends Translation<TriviaHelperStrings> {
    override readonly translations: TriviaHelperStrings = {
        triviaQuestion: "Trivia question:",
        fillInTheBlankAnswerPrompt: "Answer Question",
        fillInTheBlankModalTitle: "Trivia Question Answer Submission",
        fillInTheBlankModalLabel: "Answer",
        fillInTheBlankModalPlaceholder: "Enter your answer to the question.",
        latestChoiceRecorded: "Your latest choice (%s) has been recorded!",
    };
}
