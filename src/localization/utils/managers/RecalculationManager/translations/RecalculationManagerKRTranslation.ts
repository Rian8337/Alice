import { Translation } from "@localization/base/Translation";
import { RecalculationManagerStrings } from "../RecalculationManagerLocalization";

/**
 * The Korean translation for the `RecalculationManager` manager utility.
 */
export class RecalculationManagerKRTranslation extends Translation<RecalculationManagerStrings> {
    override readonly translations: RecalculationManagerStrings = {
        recalculationSuccessful: "%s, 성공적으로 %s를 재계산했어요.",
        recalculationFailed: "%s, %s의 재계산이 실패했어요: %s.",
        userNotBinded: "유저가 바인딩되어있지 않음",
    };
}
