import { Translation } from "@alice-localization/base/Translation";
import { ColorStrings } from "../ColorLocalization";

/**
 * The English translation for the `color` command.
 */
export class ColorENTranslation extends Translation<ColorStrings> {
    override readonly translations: ColorStrings = {
        invalidHexCode:
            "I'm sorry, that doesn't look like a valid hex code color!",
        showingHexColor: "Showing color with hex code `%s`:",
    };
}
