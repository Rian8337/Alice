import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { TimeoutMessageAuthorENTranslation } from "./translations/TimeoutMessageAuthorENTranslation";

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
    };
}
