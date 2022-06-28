import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { TimeoutMessageAuthorENTranslation } from "./translations/TimeoutMessageAuthorENTranslation";
import { TimeoutMessageAuthorESTranslation } from "./translations/TimeoutMessageAuthorESTranslation";
import { TimeoutMessageAuthorKRTranslation } from "./translations/TimeoutMessageAuthorKRTranslation";

export interface TimeoutMessageAuthorStrings {
    readonly selectDuration: string;
    readonly timeoutConfirmation: string;
    readonly timeoutFailed: string;
    readonly timeoutSuccess: string;
    readonly timeoutReason: string;
}

/**
 * Localizations for the `timeoutMessageAuthor` context menu command.
 */
export class TimeoutMessageAuthorLocalization extends Localization<TimeoutMessageAuthorStrings> {
    protected override readonly localizations: Readonly<
        Translations<TimeoutMessageAuthorStrings>
    > = {
        en: new TimeoutMessageAuthorENTranslation(),
        es: new TimeoutMessageAuthorESTranslation(),
        kr: new TimeoutMessageAuthorKRTranslation(),
    };
}
