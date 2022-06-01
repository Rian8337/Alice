import { Translation } from "@alice-localization/base/Translation";
import { TriviaHelperStrings } from "../TriviaHelperLocalization";

/**
 * The Korean translation for the `TriviaHelper` helper utility.
 */
export class TriviaHelperKRTranslation extends Translation<TriviaHelperStrings> {
    override readonly translations: TriviaHelperStrings = {
        triviaQuestion: "",
        fillInTheBlankAnswerPrompt: "",
        fillInTheBlankModalTitle: "",
        fillInTheBlankModalLabel: "",
        fillInTheBlankModalPlaceholder: "",
        latestChoiceRecorded: "당신의 최근 선택 (%s) (이)가 기록되었어요!",
    };
}
