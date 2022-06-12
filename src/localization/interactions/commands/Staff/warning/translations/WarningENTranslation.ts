import { Translation } from "@alice-localization/base/Translation";
import { WarningStrings } from "../WarningLocalization";

/**
 * The English translation for the `warning` command.
 */
export class WarningENTranslation extends Translation<WarningStrings> {
    override readonly translations: WarningStrings = {
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
        warnUnissueSuccess: "Successfully unissued the warning from the user.",
        warnTransferFailed: "I'm sorry, I couldn't transfer the warnings: %s.",
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
    };
}
