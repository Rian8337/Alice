import { Translation } from "@alice-localization/base/Translation";
import { TriviaHelperStrings } from "../TriviaHelperLocalization";

/**
 * The Spanish translation for the `TriviaHelper` helper utility.
 */
export class TriviaHelperESTranslation extends Translation<TriviaHelperStrings> {
    override readonly translations: TriviaHelperStrings = {
        latestChoiceRecorded: "Tu ultima opción (%s) ha sido guardada!",
    };
}
