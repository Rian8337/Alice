import { Translation } from "@alice-localization/base/Translation";
import { TriviaHelperStrings } from "../TriviaHelperLocalization";

/**
 * The Indonesian translation for the `TriviaHelper` helper utility.
 */
export class TriviaHelperIDTranslation extends Translation<TriviaHelperStrings> {
    override readonly translations: TriviaHelperStrings = {
        triviaQuestion: "",
        fillInTheBlankAnswerPrompt: "",
        fillInTheBlankModalTitle: "",
        fillInTheBlankModalLabel: "",
        fillInTheBlankModalPlaceholder: "",
        latestChoiceRecorded: "",
    };
}
