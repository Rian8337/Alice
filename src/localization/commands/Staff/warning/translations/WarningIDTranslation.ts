import { Translation } from "@alice-localization/base/Translation";
import { WarningStrings } from "../WarningLocalization";

/**
 * The Indonesian translation for the `warning` command.
 */
export class WarningIDTranslation extends Translation<WarningStrings> {
    override readonly translations: WarningStrings = {
        userNotFoundInServer: "",
        warningNotFound: "",
        noPermissionToViewWarning: "",
        selfDontHaveWarnings: "",
        userDontHaveWarnings: "",
        cannotTransferToSamePerson: "",
        warnIssueFailed: "",
        warnIssueSuccess: "",
        warnUnissueFailed: "",
        warnUnissueSuccess: "",
        warnTransferFailed: "",
        warnTransferSuccess: "",
        transferWarningConfirmation: "",
        warningInfoForUser: "",
        totalActivePoints: "",
        totalWarnings: "",
        lastWarning: "",
        warningIssuer: "",
        creationDate: "",
        expirationDate: "",
        channel: "",
    };
}
