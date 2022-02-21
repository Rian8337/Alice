import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface TimeoutManagerStrings {
    readonly userAlreadyTimeouted: string;
    readonly userImmuneToTimeout: string;
    readonly invalidTimeoutDuration: string;
    readonly timeoutDurationOutOfRange: string;
    readonly notEnoughPermissionToTimeout: string;
    readonly timeoutReasonTooLong: string;
    readonly timeoutExecuted: string;
    readonly untimeoutExecuted: string;
    readonly inChannel: string;
    readonly reason: string;
    readonly userId: string; // see 30.34
    readonly channelId: string;
    readonly timeoutUserNotification: string;
    readonly userNotTimeouted: string;
    readonly untimeoutReasonTooLong: string;
    readonly untimeoutUserNotification: string;
}

/**
 * Localizations for the `TimeoutManager` manager utility.
 */
export class TimeoutManagerLocalization extends Localization<TimeoutManagerStrings> {
    protected override readonly translations: Readonly<Translation<TimeoutManagerStrings>> = {
        en: {
            userAlreadyTimeouted: "user is already timeouted",
            userImmuneToTimeout: "user has timeout immunity",
            invalidTimeoutDuration: "invalid timeout duration",
            timeoutDurationOutOfRange: "timeout duration must be between 30 seconds and 28 days (4 weeks)",
            notEnoughPermissionToTimeout: "not enough permission to timeout for %s",
            timeoutReasonTooLong: "timeout reason is too long; maximum is 1500 characters",
            timeoutExecuted: "Timeout executed",
            untimeoutExecuted: "Untimeout executed",
            inChannel: "in %s",
            reason: "reason",
            timeoutUserNotification: "Hey, you were timeouted for %s for %s. Sorry!",
            userNotTimeouted: "the user is not timeouted",
            untimeoutReasonTooLong: "untimeout reason is too long; maximum is 1500 characters",
            untimeoutUserNotification: "Hey, you were untimeouted for %s.",
            userId: "User ID",
            channelId: "Channel ID",
        }
    };
}