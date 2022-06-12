import { Translation } from "@alice-localization/base/Translation";
import { UnbindStrings } from "../UnbindLocalization";

/**
 * The Korean translation for the `unbind` command.
 */
export class UnbindKRTranslation extends Translation<UnbindStrings> {
    override readonly translations: UnbindStrings = {
        invalidUid: "저기, 올바른 uid를 입력해 주세요!",
        uidNotBinded: "죄송해요, 이 uid는 바인딩 되어있지 않아요!",
        unbindFailed: "죄송해요, 다음 uid의 바인딩을 해제할 수 없었어요: %s.",
        unbindSuccessful: "성공적으로 uid %s 의 바인딩을 해제했어요.",
    };
}
