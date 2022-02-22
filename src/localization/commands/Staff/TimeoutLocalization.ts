import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface TimeoutStrings {
    readonly userToTimeoutNotFound: string;
    readonly timeoutFailed: string;
    readonly timeoutSuccess: string;
}

/**
 * Localizations for the `timeout` command.
 */
export class TimeoutLocalization extends Localization<TimeoutStrings> {
    protected override readonly translations: Readonly<
        Translation<TimeoutStrings>
    > = {
        en: {
            userToTimeoutNotFound: "Hey, please enter a valid user to timeout!",
            timeoutFailed: "I'm sorry, I cannot timeout the user: `%s`.",
            timeoutSuccess: "Successfully timeouted the user for %s.",
        },
        kr: {
            userToTimeoutNotFound:
                "저기, 타임아웃시킬 유효한 유저를 입력해 주세요!",
            timeoutFailed: "죄송해요, 그 유저를 타임아웃 시킬 수 없어요: %s.",
            timeoutSuccess:
                "성공적으로 그 유저를 다음 시간만큼 타임아웃 시켰어요: %s.",
        },
    };
}
