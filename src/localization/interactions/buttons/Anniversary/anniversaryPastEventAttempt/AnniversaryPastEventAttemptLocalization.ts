import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { AnniversaryPastEventAttemptENTranslation } from "./translations/AnniversaryPastEventAttemptENTranslation";

export interface AnniversaryPastEventAttemptStrings {
    readonly noPastAttempts: string;
    readonly noFirstAttempt: string;
    readonly noSecondAttempt: string;
}

/**
 * Localizations for the `anniversaryPastEventAttempt` button command.
 */
export class AnniversaryPastEventAttemptLocalization extends Localization<AnniversaryPastEventAttemptStrings> {
    protected override readonly localizations: Readonly<
        Translations<AnniversaryPastEventAttemptStrings>
    > = {
        en: new AnniversaryPastEventAttemptENTranslation(),
    };
}
