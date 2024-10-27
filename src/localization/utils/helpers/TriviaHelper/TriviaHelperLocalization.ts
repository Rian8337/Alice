import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { TriviaHelperENTranslation } from "./translations/TriviaHelperENTranslation";
import { TriviaHelperESTranslation } from "./translations/TriviaHelperESTranslation";
import { TriviaHelperIDTranslation } from "./translations/TriviaHelperIDTranslation";
import { TriviaHelperKRTranslation } from "./translations/TriviaHelperKRTranslation";

export interface TriviaHelperStrings {
    readonly triviaQuestion: string;
    readonly fillInTheBlankAnswerPrompt: string;
    readonly fillInTheBlankModalTitle: string;
    readonly fillInTheBlankModalLabel: string;
    readonly fillInTheBlankModalPlaceholder: string;
    readonly latestChoiceRecorded: string;
}

/**
 * Localizations for the `TriviaHelper` helper utility.
 */
export class TriviaHelperLocalization extends Localization<TriviaHelperStrings> {
    protected override readonly localizations: Readonly<
        Translations<TriviaHelperStrings>
    > = {
        en: new TriviaHelperENTranslation(),
        kr: new TriviaHelperKRTranslation(),
        id: new TriviaHelperIDTranslation(),
        es: new TriviaHelperESTranslation(),
    };
}
