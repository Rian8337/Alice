import { Translation } from "@alice-localization/base/Translation";
import { FancyApplicationRejectPendingStrings } from "../FancyApplicationRejectPendingLocalization";

/**
 * The English translation for the `fancy-application-reject-pending` modal command.
 */
export class FancyApplicationRejectPendingENTranslation extends Translation<FancyApplicationRejectPendingStrings> {
    override readonly translations: FancyApplicationRejectPendingStrings = {
        applicationNotFound: "I'm sorry, I could not find the application!",
        applicationNotPending:
            "I'm sorry, this application is not in pending approval status!",
        applicationRejectFailed:
            "I'm sorry, I could not reject the application: %s.",
        applicationRejectSuccess: "Successfully rejected the application.",
    };
}
