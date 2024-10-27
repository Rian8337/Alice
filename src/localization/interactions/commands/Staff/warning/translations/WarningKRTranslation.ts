import { Translation } from "@localization/base/Translation";
import { WarningStrings } from "../WarningLocalization";

/**
 * The Korean translation for the `warning` command.
 */
export class WarningKRTranslation extends Translation<WarningStrings> {
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
        creationDate: "생성 날짜",
        expirationDate: "만료일",
        channel: "채널",
    };
}
