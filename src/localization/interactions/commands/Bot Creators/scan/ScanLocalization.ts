import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { ScanENTranslation } from "./translations/ScanENTranslation";
import { ScanESTranslation } from "./translations/ScanESTranslation";
import { ScanIDTranslation } from "./translations/ScanIDTranslation";
import { ScanKRTranslation } from "./translations/ScanKRTranslation";

export interface ScanStrings {
    readonly scanComplete: string;
    readonly scanStarted: string;
}

/**
 * Localizations for the `scan` command.
 */
export class ScanLocalization extends Localization<ScanStrings> {
    protected override readonly localizations: Readonly<
        Translations<ScanStrings>
    > = {
        en: new ScanENTranslation(),
        kr: new ScanKRTranslation(),
        id: new ScanIDTranslation(),
        es: new ScanESTranslation(),
    };
}
