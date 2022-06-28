import { Translation } from "@alice-localization/base/Translation";
import { WarnMessageAuthorStrings } from "../WarnMessageAuthorLocalization";

/**
 * The English translation for the `warnMessageAuthor` context menu command.
 */
export class WarnMessageAuthorENTranslation extends Translation<WarnMessageAuthorStrings> {
    override readonly translations: WarnMessageAuthorStrings = {
        selectPoints:
            "Please select the amount of warning points that you want to give.",
        selectDuration:
            "Please select the duration at which the warning will be active for.",
        warningConfirmation:
            "Are you sure you want to issue a warn to %s with %s warning points for %s?",
        warnIssueFailed:
            "I'm sorry, I couldn't issue a warning to the user: %s.",
        warnIssueSuccess: "Successfully warned the user.",
        warningReason: "Inappropriate message: %s (%s)",
    };
}
