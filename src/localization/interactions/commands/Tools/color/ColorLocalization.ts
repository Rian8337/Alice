import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { ColorENTranslation } from "./translations/ColorENTranslation";
import { ColorESTranslation } from "./translations/ColorESTranslation";
import { ColorKRTranslation } from "./translations/ColorKRTranslation";

export interface ColorStrings {
    readonly invalidHexCode: string;
    readonly showingHexColor: string;
}

/**
 * Localizations for the `color` command.
 */
export class ColorLocalization extends Localization<ColorStrings> {
    protected override readonly localizations: Readonly<
        Translations<ColorStrings>
    > = {
        en: new ColorENTranslation(),
        kr: new ColorKRTranslation(),
        es: new ColorESTranslation(),
    };
}
