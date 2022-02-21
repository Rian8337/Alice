import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface ColorStrings {
    readonly invalidHexCode: string;
    readonly showingHexColor: string;
}

/**
 * Localizations for the `color` command.
 */
export class ColorLocalization extends Localization<ColorStrings> {
    protected override readonly translations: Readonly<
        Translation<ColorStrings>
    > = {
        en: {
            invalidHexCode:
                "I'm sorry, that doesn't look like a valid hex code color!",
            showingHexColor: "Showing color with hex code `%s`:",
        },
    };
}
