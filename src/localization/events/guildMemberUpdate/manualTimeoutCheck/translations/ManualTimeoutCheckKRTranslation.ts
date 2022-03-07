import { Translation } from "@alice-localization/base/Translation";
import { ManualTimeoutCheckStrings } from "../ManualTimeoutCheckLocalization";

/**
 * The Korean translation for the `manualTimeoutCheck` event utility for `guildMemberUpdate` event.
 */
export class ManualTimeoutCheckKRTranslation extends Translation<ManualTimeoutCheckStrings> {
    override readonly translations: ManualTimeoutCheckStrings = {
        notSpecified: "지정되지 않음.",
        timeoutExecuted: "타임아웃 실행됨",
        untimeoutExecuted: "타임아웃 해제 실행됨",
        inChannel: "%s에서",
        reason: "이유",
        userId: "유저 ID",
        channelId: "채널 ID",
        timeoutUserNotification:
            "저기, 당신은 %s 동안 다음 이유로 타임아웃 당했어요: %s. 죄송해요!",
        untimeoutUserNotification:
            "저기, 당신은 다음 이유로 타임아웃이 해제되었어요: %s.",
    };
}
