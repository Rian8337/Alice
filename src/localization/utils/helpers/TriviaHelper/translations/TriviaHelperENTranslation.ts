import { Translation } from "@alice-localization/base/Translation";
import { TriviaHelperStrings } from "../TriviaHelperLocalization";

/**
 * The English translation for the `TriviaHelper` helper utility.
 */
export class TriviaHelperENTranslation extends Translation<TriviaHelperStrings> {
    override readonly translations: TriviaHelperStrings = {
        latestChoiceRecorded: "Your latest choice (%s) has been recorded!",
    };
}
