import { Translation } from "@alice-localization/base/Translation";
import { ColorStrings } from "../ColorLocalization";

/**
 * The Spanish translation for the `color` command.
 */
export class ColorESTranslation extends Translation<ColorStrings> {
    override readonly translations: ColorStrings = {
        invalidHexCode: "Lo siento, ese no es un codigo HEX valido!",
        showingHexColor: "Mostrando color con codigo HEX %s:",
    };
}
