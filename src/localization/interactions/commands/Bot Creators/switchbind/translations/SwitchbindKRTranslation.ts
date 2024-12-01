import { Translation } from "@localization/base/Translation";
import { SwitchbindStrings } from "../SwitchbindLocalization";

/**
 * The Korean translation of the `switchbind` command.
 */
export class SwitchbindKRTranslation extends Translation<SwitchbindStrings> {
    override readonly translations: SwitchbindStrings = {
        invalidUid: "저기, 올바른 uid를 입력해 주세요!",
        uidNotBinded: "죄송해요, 이 uid는 누구에게도 바인딩 되어있지 않아요!",
        switchFailed: "죄송해요, 바인딩을 변경할 수 없어요: %s.",
        switchSuccessful: "성공적으로 바인딩을 변경했어요.",
    };
}
