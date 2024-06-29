import { Translation } from "@alice-localization/base/Translation";
import { FancyApplicationRejectPendingStrings } from "../FancyApplicationRejectPendingLocalization";

/**
 * The English translation for the `fancyApplicationRejectPending` command.
 */
export class FancyApplicationRejectENTranslation extends Translation<FancyApplicationRejectPendingStrings> {
    override readonly translations: FancyApplicationRejectPendingStrings = {
        modalTitle: "Reject Application",
        reasonLabel: "Reason",
        reasonPlaceholder: "Enter the reason for rejecting the application.",
    };
}
