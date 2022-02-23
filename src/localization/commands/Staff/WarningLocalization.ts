import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface WarningStrings {
    readonly userNotFoundInServer: string;
    readonly warningNotFound: string;
    readonly noPermissionToViewWarning: string;
    readonly selfDontHaveWarnings: string;
    readonly userDontHaveWarnings: string;
    readonly cannotTransferToSamePerson: string;
    readonly warnIssueFailed: string;
    readonly warnIssueSuccess: string;
    readonly warnUnissueFailed: string;
    readonly warnUnissueSuccess: string;
    readonly warnTransferFailed: string;
    readonly warnTransferSuccess: string;
    readonly transferWarningConfirmation: string;
    readonly warningInfoForUser: string;
    readonly totalActivePoints: string;
    readonly totalWarnings: string;
    readonly lastWarning: string;
    readonly warningIssuer: string;
    readonly creationDate: string;
    readonly expirationDate: string;
    readonly channel: string;
}

/**
 * Localizations for the `warning` command.
 */
export class WarningLocalization extends Localization<WarningStrings> {
    protected override readonly translations: Readonly<
        Translation<WarningStrings>
    > = {
        en: {
            userNotFoundInServer:
                "I'm sorry, I couldn't find the user in this server!",
            warningNotFound:
                "I'm sorry, I cannot find any warning with that ID in this server!",
            noPermissionToViewWarning:
                "I'm sorry, you can only view your own warnings unless you have the permission to warn other users.",
            selfDontHaveWarnings:
                "I'm sorry, you do not have any warnings in this server!",
            userDontHaveWarnings:
                "I'm sorry, this user does not have any warnings in this server!",
            cannotTransferToSamePerson:
                "Hey, you cannot transfer warnings to the same person!",
            warnIssueFailed:
                "I'm sorry, I couldn't issue a warning to the user: %s.",
            warnIssueSuccess: "Successfully warned the user.",
            warnUnissueFailed:
                "I'm sorry, I couldn't unissue the warning from the user: %s.",
            warnUnissueSuccess:
                "Successfully unissued the warning from the user.",
            warnTransferFailed:
                "I'm sorry, I couldn't transfer the warnings: %s.",
            warnTransferSuccess: "Successfully transferred warnings.",
            transferWarningConfirmation:
                "Are you sure you want to transfer all warnings?",
            warningInfoForUser: "Warning Info for %s",
            totalActivePoints: "Total Active Points",
            totalWarnings: "Total Warning",
            lastWarning: "Last Warning",
            warningIssuer: "Issuer",
            creationDate: "Creation Date",
            expirationDate: "Expiration Date",
            channel: "Channel",
        },
        kr: {
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
        },
        id: {
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
        },
    };
}
