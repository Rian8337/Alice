import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { TriviaHelperENTranslation } from "./translations/TriviaHelperENTranslation";
import { TriviaHelperIDTranslation } from "./translations/TriviaHelperIDTranslation";
import { TriviaHelperKRTranslation } from "./translations/TriviaHelperKRTranslation";

export interface TriviaHelperStrings {
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
    };
}
