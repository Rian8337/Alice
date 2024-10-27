import { Translation } from "@localization/base/Translation";
import { DateTimeFormatHelperStrings } from "../DateTimeFormatHelperLocalization";

/**
 * The Indonesian translation for the `DateTimeFormatHelper` helper utility.
 */
export class DateTimeFormatHelperIDTranslation extends Translation<DateTimeFormatHelperStrings> {
    override readonly translations: DateTimeFormatHelperStrings = {
        day: "hari",
        days: "hari",
        hour: "jam",
        hours: "jam",
        minute: "menit",
        minutes: "menit",
        second: "detik",
        seconds: "detik",
    };
}
