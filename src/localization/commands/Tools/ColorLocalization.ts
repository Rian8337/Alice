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
        kr: {
            invalidHexCode:
                "죄송해요, 그건 유효한 hex코드 값이 아닌 것 같네요!",
            showingHexColor: "hex코드 %s의 색상을 보여드릴게요:",
        },
        id: {
            invalidHexCode: "",
            showingHexColor: "",
        },
    };
}
