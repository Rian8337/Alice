import { Translation } from "@localization/base/Translation";
import { DateTimeFormatHelperStrings } from "../DateTimeFormatHelperLocalization";

export class DateTimeFormatHelperESTranslation extends Translation<DateTimeFormatHelperStrings> {
    override readonly translations: DateTimeFormatHelperStrings = {
        day: "día",
        days: "días",
        hour: "hora",
        hours: "horas",
        minute: "minuto",
        minutes: "minutos",
        second: "segundo",
        seconds: "segundos",
    };
}
