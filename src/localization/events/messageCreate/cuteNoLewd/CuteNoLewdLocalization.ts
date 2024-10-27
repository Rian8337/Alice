import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { CuteNoLewdENTranslation } from "./translations/CuteNoLewdENTranslation";
import { CuteNoLewdESTranslation } from "./translations/CuteNoLewdESTranslation";
import { CuteNoLewdIDTranslation } from "./translations/CuteNoLewdIDTranslation";
import { CuteNoLewdKRTranslation } from "./translations/CuteNoLewdKRTranslation";

export interface CuteNoLewdStrings {
    readonly imageSentTooFast: string;
}

/**
 * Localizations for the `cuteNoLewd` event utility in `messageCreate` event.
 */
export class CuteNoLewdLocalization extends Localization<CuteNoLewdStrings> {
    protected override readonly localizations: Readonly<
        Translations<CuteNoLewdStrings>
    > = {
        en: new CuteNoLewdENTranslation(),
        kr: new CuteNoLewdKRTranslation(),
        id: new CuteNoLewdIDTranslation(),
        es: new CuteNoLewdESTranslation(),
    };
}
