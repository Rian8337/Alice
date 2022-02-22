import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

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
    protected override readonly translations: Readonly<
        Translation<DateTimeFormatHelperStrings>
    > = {
        en: {
            day: "day",
            days: "days",
            hour: "hour",
            hours: "hours",
            minute: "minute",
            minutes: "minutes",
            second: "second",
            seconds: "seconds",
        },
        kr: {
            day: "일",
            days: "",
            hour: "시간",
            hours: "",
            minute: "분",
            minutes: "",
            second: "초",
            seconds: "초",
        },
    };
}
