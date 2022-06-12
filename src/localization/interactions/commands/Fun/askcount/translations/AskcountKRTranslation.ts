import { Translation } from "@alice-localization/base/Translation";
import { AskcountStrings } from "../AskcountLocalization";

/**
 * The Korean translation for the `askcount` command.
 */
export class AskcountKRTranslation extends Translation<AskcountStrings> {
    override readonly translations: AskcountStrings = {
        haveNotAsked: "죄송해요, 아직 저한테 질문한 적이 없으신 것 같네요!",
        askCount: "저한테 %s번 질문하셨어요.",
    };
}
