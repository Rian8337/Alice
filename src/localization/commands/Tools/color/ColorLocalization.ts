import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { ColorENTranslation } from "./translations/ColorENTranslation";
import { ColorIDTranslation } from "./translations/ColorIDTranslation";
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
        id: new ColorIDTranslation(),
    };
}
