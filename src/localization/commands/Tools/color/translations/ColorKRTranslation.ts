import { Translation } from "@alice-localization/base/Translation";
import { ColorStrings } from "../ColorLocalization";

/**
 * The Korean translation for the `color` command.
 */
export class ColorKRTranslation extends Translation<ColorStrings> {
    override readonly translations: ColorStrings = {
        invalidHexCode: "죄송해요, 그건 유효한 hex코드 값이 아닌 것 같네요!",
        showingHexColor: "hex코드 %s의 색상을 보여드릴게요:",
    };
}
