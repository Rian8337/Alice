import { Translation } from "@alice-localization/base/Translation";
import { ColorStrings } from "../ColorLocalization";

/**
 * The Indonesian translation for the `color` command.
 */
export class ColorIDTranslation extends Translation<ColorStrings> {
    override readonly translations: ColorStrings = {
        invalidHexCode: "",
        showingHexColor: "",
    };
}
