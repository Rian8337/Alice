import { Translation } from "@alice-localization/base/Translation";
import { TimeoutMessageAuthorStrings } from "../TimeoutMessageAuthorLocalization";

/**
 * The Spanish translation for the `timeoutMessageAuthor` context menu command.
 */
export class TimeoutMessageAuthorESTranslation extends Translation<TimeoutMessageAuthorStrings> {
    override readonly translations: TimeoutMessageAuthorStrings = {
        selectDuration: "",
        timeoutConfirmation: "",
        timeoutFailed: "",
        timeoutSuccess: "",
        timeoutReason: "",
    };
}
