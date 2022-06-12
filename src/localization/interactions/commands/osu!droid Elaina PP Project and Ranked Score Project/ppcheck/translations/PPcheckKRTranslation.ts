import { Translation } from "@alice-localization/base/Translation";
import { PPcheckStrings } from "../PPcheckLocalization";

/**
 * The Korean translation for the `ppcheck` command.
 */
export class PPcheckKRTranslation extends Translation<PPcheckStrings> {
    override readonly translations: PPcheckStrings = {
        tooManyOptions:
            "죄송해요, uid, 유저, 유저네임 중 하나만 사용할 수 있어요! 이것들을 함께 쓸 수 없어요!",
    };
}
