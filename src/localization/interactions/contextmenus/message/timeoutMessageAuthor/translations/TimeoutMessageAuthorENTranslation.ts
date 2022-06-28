import { Translation } from "@alice-localization/base/Translation";
import { TimeoutMessageAuthorStrings } from "../TimeoutMessageAuthorLocalization";

/**
 * The English translation for the `timeoutMessageAuthor` context menu command.
 */
export class TimeoutMessageAuthorENTranslation extends Translation<TimeoutMessageAuthorStrings> {
    override readonly translations: TimeoutMessageAuthorStrings = {
        selectDuration:
            "Please select the duration at which the timeout will be active for.",
        timeoutConfirmation: "Are you sure you want to timeout %s for %s?",
        timeoutFailed: "I'm sorry, I cannot timeout the user: `%s`.",
        timeoutSuccess: "Successfully timeouted the user for %s.",
        timeoutReason: "Inappropriate message: %s (%s)",
    };
}
