import { Translation } from "@alice-localization/base/Translation";
import { WarningManagerStrings } from "../WarningManagerLocalization";

/**
 * The Indonesian translation for the `WarningManager` manager utility.
 */
export class WarningManagerIDTranslation extends Translation<WarningManagerStrings> {
    override readonly translations: WarningManagerStrings = {
        channelNotSendable: "",
        notInServer: "",
        userIsImmune: "",
        userNotFoundInServer: "",
        invalidDuration: "",
        durationOutOfRange: "",
        notEnoughPermissionToWarn: "",
        reasonTooLong: "",
        warningIssued: "",
        warningId: "",
        warningUnissued: "",
        warningTransferred: "",
        fromUser: "",
        toUser: "",
        userId: "",
        channelId: "",
        warningIssueInChannel: "",
        warnedUser: "",
        inChannel: "",
        warningReason: "",
        warningUnissueReason: "",
        reason: "",
        points: "",
        notSpecified: "",
        warnIssueUserNotification: "",
        warnUnissueUserNotification: "",
    };
}
