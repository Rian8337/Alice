import { Translation } from "@alice-localization/base/Translation";
import { WarningManagerStrings } from "../WarningManagerLocalization";

/**
 * The English translation for the `WarningManager` manager utility.
 */
export class WarningManagerENTranslation extends Translation<WarningManagerStrings> {
    override readonly translations: WarningManagerStrings = {
        channelNotSendable: "channel is not sendable",
        notInServer: "not in server",
        userIsImmune: "user cannot be warned",
        userNotFoundInServer: "user not found in server",
        invalidDuration: "invalid warning duration",
        durationOutOfRange:
            "warning duration must be between 3 hours and 28 days (4 weeks)",
        notEnoughPermissionToWarn: "not enough permission to issue warning",
        reasonTooLong: "reason is too long; maximum is 1500 characters",
        warningIssued: "Warning issued",
        warningUnissued: "Warning unissued",
        warningTransferred: "Warnings transferred",
        fromUser: "From",
        toUser: "To",
        warningId: "Warning ID",
        userId: "User ID",
        channelId: "Channel ID",
        warningIssueInChannel: "Warning issued in %s",
        warnedUser: "Warned user",
        inChannel: "in %s",
        warningReason: "Warning reason",
        warningUnissueReason: "Warning unissue reason",
        reason: "Reason",
        points: "Points",
        notSpecified: "Not specified.",
        warnIssueUserNotification:
            "Hey, you have been issued a warning for `%s`. Sorry!",
        warnUnissueUserNotification:
            "Hey, your warning with ID `%s` has been unissued for `%s`.",
    };
}
