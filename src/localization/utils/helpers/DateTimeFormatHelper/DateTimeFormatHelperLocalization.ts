import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { DateTimeFormatHelperENTranslation } from "./translations/DateTimeFormatHelperENTranslation";
import { DateTimeFormatHelperESTranslation } from "./translations/DateTimeFormatHelperESTranslation";
import { DateTimeFormatHelperIDTranslation } from "./translations/DateTimeFormatHelperIDTranslation";
import { DateTimeFormatHelperKRTranslation } from "./translations/DateTimeFormatHelperKRTranslation";

export interface DateTimeFormatHelperStrings {
    readonly day: string;
    readonly days: string;
    readonly hour: string;
    readonly hours: string;
    readonly minute: string;
    readonly minutes: string;
    readonly second: string;
    readonly seconds: string;
}

/**
 * Localizations for the `DateTimeFormatHelper` helper utility.
 */
export class DateTimeFormatHelperLocalization extends Localization<DateTimeFormatHelperStrings> {
    protected override readonly localizations: Readonly<
        Translations<DateTimeFormatHelperStrings>
    > = {
        en: new DateTimeFormatHelperENTranslation(),
        kr: new DateTimeFormatHelperKRTranslation(),
        id: new DateTimeFormatHelperIDTranslation(),
        es: new DateTimeFormatHelperESTranslation(),
    };
}
