import { Translation } from "@alice-localization/base/Translation";
import { WarningManagerStrings } from "../WarningManagerLocalization";

/**
 * The Korean translation for the `WarningManager` manager utility.
 */
export class WarningManagerKRTranslation extends Translation<WarningManagerStrings> {
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
        userId: "유저 ID",
        channelId: "채널 ID",
        warningIssueInChannel: "",
        warnedUser: "",
        inChannel: "%s에서",
        warningReason: "",
        warningUnissueReason: "",
        reason: "이유",
        points: "포인트",
        notSpecified: "지정되지 않음.",
        warnIssueUserNotification: "",
        warnUnissueUserNotification: "",
    };
}
