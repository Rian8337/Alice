import { Translation } from "@localization/base/Translation";
import { TriviaHelperStrings } from "../TriviaHelperLocalization";

/**
 * The Spanish translation for the `TriviaHelper` helper utility.
 */
export class TriviaHelperESTranslation extends Translation<TriviaHelperStrings> {
    override readonly translations: TriviaHelperStrings = {
        triviaQuestion: "",
        fillInTheBlankAnswerPrompt: "",
        fillInTheBlankModalTitle: "",
        fillInTheBlankModalLabel: "",
        fillInTheBlankModalPlaceholder: "",
        latestChoiceRecorded: "Tu ultima opción (%s) ha sido guardada!",
    };
}
