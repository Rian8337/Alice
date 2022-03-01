import { Translation } from "@alice-localization/base/Translation";
import { DateTimeFormatHelperStrings } from "../DateTimeFormatHelperLocalization";

/**
 * The Korean translation for the `DateTimeFormatHelper` helper utility.
 */
export class DateTimeFormatHelperKRTranslation extends Translation<DateTimeFormatHelperStrings> {
    override readonly translations: DateTimeFormatHelperStrings = {
        day: "일",
        days: "일",
        hour: "시간",
        hours: "시간",
        minute: "분",
        minutes: "분",
        second: "초",
        seconds: "초",
    };
}
