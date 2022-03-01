import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { DroidProfileENTranslation } from "./translations/DroidProfileENTranslation";
import { DroidProfileIDTranslation } from "./translations/DroidProfileIDTranslation";
import { DroidProfileKRTranslation } from "./translations/DroidProfileKRTranslation";

export interface DroidProfileStrings {
    readonly droidProfile: string;
}

/**
 * Localizations for the `droidProfile` event utility in `messageCreate` event.
 */
export class DroidProfileLocalization extends Localization<DroidProfileStrings> {
    protected override readonly localizations: Readonly<
        Translations<DroidProfileStrings>
    > = {
        en: new DroidProfileENTranslation(),
        kr: new DroidProfileKRTranslation(),
        id: new DroidProfileIDTranslation(),
    };
}
