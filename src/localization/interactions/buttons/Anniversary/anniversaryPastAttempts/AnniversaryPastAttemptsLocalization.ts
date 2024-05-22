import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { AnniversaryPastAttemptsENTranslation } from "./translations/AnniversaryPastAttemptsENTranslation";

export interface AnniversaryPastAttemptsStrings {
    readonly noPastAttempts: string;
    readonly noFirstAttempt: string;
    readonly noSecondAttempt: string;
}

/**
 * Localizations for the `anniversaryPastAttempts` button command.
 */
export class AnniversaryPastAttemptsLocalization extends Localization<AnniversaryPastAttemptsStrings> {
    protected override readonly localizations: Readonly<
        Translations<AnniversaryPastAttemptsStrings>
    > = {
        en: new AnniversaryPastAttemptsENTranslation(),
    };
}
