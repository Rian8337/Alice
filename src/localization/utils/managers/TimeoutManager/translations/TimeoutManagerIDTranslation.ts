import { Translation } from "@localization/base/Translation";
import { TimeoutManagerStrings } from "../TimeoutManagerLocalization";

/**
 * The Indonesian translation for the `TimeoutManager` manager utility.
 */
export class TimeoutManagerIDTranslation extends Translation<TimeoutManagerStrings> {
    override readonly translations: TimeoutManagerStrings = {
        userAlreadyTimeouted: "",
        userImmuneToTimeout: "",
        invalidTimeoutDuration: "",
        timeoutDurationOutOfRange: "",
        notEnoughPermissionToTimeout: "",
        timeoutReasonTooLong: "",
        timeoutExecuted: "",
        untimeoutExecuted: "",
        inChannel: "",
        reason: "",
        userId: "",
        channelId: "",
        timeoutUserNotification: "",
        userNotTimeouted: "",
        untimeoutReasonTooLong: "",
        untimeoutUserNotification: "",
    };
}
