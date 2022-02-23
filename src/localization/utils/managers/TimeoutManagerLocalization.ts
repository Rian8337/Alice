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
    protected override readonly translations: Readonly<
        Translation<TimeoutManagerStrings>
    > = {
        en: {
            userAlreadyTimeouted: "user is already timeouted",
            userImmuneToTimeout: "user has timeout immunity",
            invalidTimeoutDuration: "invalid timeout duration",
            timeoutDurationOutOfRange:
                "timeout duration must be between 30 seconds and 28 days (4 weeks)",
            notEnoughPermissionToTimeout:
                "not enough permission to timeout for %s",
            timeoutReasonTooLong:
                "timeout reason is too long; maximum is 1500 characters",
            timeoutExecuted: "Timeout executed",
            untimeoutExecuted: "Untimeout executed",
            inChannel: "in %s",
            reason: "Reason",
            timeoutUserNotification:
                "Hey, you were timeouted for %s for %s. Sorry!",
            userNotTimeouted: "the user is not timeouted",
            untimeoutReasonTooLong:
                "untimeout reason is too long; maximum is 1500 characters",
            untimeoutUserNotification: "Hey, you were untimeouted for %s.",
            userId: "User ID",
            channelId: "Channel ID",
        },
        kr: {
            userAlreadyTimeouted: "유저가 이미 타임아웃 당함",
            userImmuneToTimeout: "유저가 타임아웃에 면역임",
            invalidTimeoutDuration: "유효하지 않은 타임아웃 지속시간",
            timeoutDurationOutOfRange:
                "타임아웃 지속시간은 최소 30초에서 28일(4주)까지만 가능",
            notEnoughPermissionToTimeout:
                "%s 동안 타임아웃을 적용시킬 권한이 부족함",
            timeoutReasonTooLong: "타임아웃 이유가 너무 김 - 최대 1500자",
            timeoutExecuted: "타임아웃 실행됨",
            untimeoutExecuted: "",
            inChannel: "%s에서",
            reason: "이유",
            userId: "유저 ID",
            channelId: "",
            timeoutUserNotification:
                "저기, 당신은 %s 동안 다음 이유로 타임아웃 당했어요: %s. 죄송해요!",
            userNotTimeouted: "해당 유저는 타임아웃되지 않음",
            untimeoutReasonTooLong: "타임아웃 이유가 너무 김 - 최대 1500자",
            untimeoutUserNotification:
                "저기, 당신은 다음 이유로 타임아웃이 해제되었어요: %s.",
        },
        id: {
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
        },
    };
}
