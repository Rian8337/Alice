import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface SwitchbindStrings {
    readonly invalidUid: string;
    readonly uidNotBinded: string;
    readonly switchFailed: string;
    readonly switchSuccessful: string;
}

/**
 * Localizations for the `switchbind` command.
 */
export class SwitchbindLocalization extends Localization<SwitchbindStrings> {
    protected override readonly translations: Readonly<
        Translation<SwitchbindStrings>
    > = {
        en: {
            invalidUid: "Hey, please enter a valid uid!",
            uidNotBinded: "I'm sorry, this uid is not binded to anyone!",
            switchFailed: "I'm sorry, I'm unable to switch the bind: %s.",
            switchSuccessful: "Successfully switched bind.",
        },
        kr: {
            invalidUid: "저기, 올바른 uid를 입력해 주세요!",
            uidNotBinded:
                "죄송해요, 이 uid는 누구에게도 바인딩 되어있지 않아요!",
            switchFailed: "죄송해요, 바인딩을 변경할 수 없어요: %s.",
            switchSuccessful: "성공적으로 바인딩을 변경했어요.",
        },
        id: {
            invalidUid: "Hei, mohon berikan uid yang benar!",
            uidNotBinded: "Maaf, uid ini tidak terhubung ke seorang pengguna!",
            switchFailed: "Maaf, aku tidak bisa memindahkan uid tersebut: %s.",
            switchSuccessful: "Berhasil memindahkan uid.",
        },
    };
}
