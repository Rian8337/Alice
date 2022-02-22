import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface UnbindStrings {
    readonly invalidUid: string;
    readonly uidNotBinded: string;
    readonly unbindFailed: string;
    readonly unbindSuccessful: string;
}

/**
 * Localizations for the `unbind` command.
 */
export class UnbindLocalization extends Localization<UnbindStrings> {
    protected override readonly translations: Readonly<
        Translation<UnbindStrings>
    > = {
        en: {
            invalidUid: "Hey, please enter a valid uid!",
            uidNotBinded: "I'm sorry, the uid is not binded!",
            unbindFailed: "I'm sorry, I couldn't unbind the uid: %s.",
            unbindSuccessful: "Successfully unbinded uid %s.",
        },
        kr: {
            invalidUid: "저기, 올바른 uid를 입력해 주세요!",
            uidNotBinded: "죄송해요, 이 uid는 바인딩 되어있지 않아요!",
            unbindFailed:
                "죄송해요, 다음 uid의 바인딩을 해제할 수 없었어요: %s.",
            unbindSuccessful: "성공적으로 uid %s 의 바인딩을 해제했어요.",
        },
    };
}
