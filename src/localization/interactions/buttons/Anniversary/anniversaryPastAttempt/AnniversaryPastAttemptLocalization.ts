import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { AnniversaryPastAttemptENTranslation } from "./translations/AnniversaryPastAttemptENTranslation";

export interface AnniversaryPastAttemptStrings {
    readonly noPastAttempts: string;
    readonly noPastAttempt: string;
    readonly selectIndex: string;
}

/**
 * Localizations for the `anniversaryPastAttempt` button command.
 */
export class AnniversaryPastAttemptLocalization extends Localization<AnniversaryPastAttemptStrings> {
    protected override readonly localizations: Readonly<
        Translations<AnniversaryPastAttemptStrings>
    > = {
        en: new AnniversaryPastAttemptENTranslation(),
    };
}
