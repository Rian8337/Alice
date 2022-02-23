import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface WarningManagerStrings {
    readonly userIsImmune: string;
    readonly userNotFoundInServer: string;
    readonly invalidDuration: string;
    readonly durationOutOfRange: string;
    readonly notEnoughPermissionToWarn: string;
    readonly reasonTooLong: string;
    readonly warningIssued: string;
    readonly warningUnissued: string;
    readonly warningTransferred: string;
    readonly fromUser: string;
    readonly toUser: string;
    readonly warningId: string;
    readonly userId: string;
    readonly channelId: string;
    readonly warningIssueInChannel: string;
    readonly warnedUser: string;
    readonly inChannel: string;
    readonly warningReason: string;
    readonly warningUnissueReason: string;
    readonly reason: string;
    readonly points: string;
    readonly notSpecified: string;
    readonly warnIssueUserNotification: string;
    readonly warnUnissueUserNotification: string;
}

/**
 * Localizations for the `WarningManager` manager utility.
 */
export class WarningManagerLocalization extends Localization<WarningManagerStrings> {
    protected override readonly translations: Readonly<
        Translation<WarningManagerStrings>
    > = {
        en: {
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
        },
        kr: {
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
            channelId: "",
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
        },
        id: {
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
        },
    };
}
