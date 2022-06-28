import { Translation } from "@alice-localization/base/Translation";
import { TimeoutMessageAuthorStrings } from "../TimeoutMessageAuthorLocalization";

/**
 * The Korean translation for the `timeoutMessageAuthor` context menu command.
 */
export class TimeoutMessageAuthorKRTranslation extends Translation<TimeoutMessageAuthorStrings> {
    override readonly translations: TimeoutMessageAuthorStrings = {
        selectDuration: "",
        timeoutConfirmation: "",
        timeoutFailed: "",
        timeoutSuccess: "",
        timeoutReason: "",
    };
}
