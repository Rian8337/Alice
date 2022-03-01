import { Translation } from "@alice-localization/base/Translation";
import { DateTimeFormatHelperStrings } from "../DateTimeFormatHelperLocalization";

/**
 * The English translation for the `DateTimeFormatHelper` helper utility.
 */
export class DateTimeFormatHelperENTranslation extends Translation<DateTimeFormatHelperStrings> {
    override readonly translations: DateTimeFormatHelperStrings = {
        day: "day",
        days: "days",
        hour: "hour",
        hours: "hours",
        minute: "minute",
        minutes: "minutes",
        second: "second",
        seconds: "seconds",
    };
}
