import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { RecalculationManagerENTranslation } from "./translations/RecalculationManagerENTranslation";
import { RecalculationManagerESTranslation } from "./translations/RecalculationManagerESTranslation";
import { RecalculationManagerKRTranslation } from "./translations/RecalculationManagerKRTranslation";

export interface RecalculationManagerStrings {
    readonly recalculationSuccessful: string;
    readonly recalculationFailed: string;
    readonly userNotBinded: string;
    readonly userDPPBanned: string;
}

/**
 * Localizations for the `RecalculationManager` manager utility.
 */
export class RecalculationManagerLocalization extends Localization<RecalculationManagerStrings> {
    protected override readonly localizations: Readonly<
        Translations<RecalculationManagerStrings>
    > = {
        en: new RecalculationManagerENTranslation(),
        kr: new RecalculationManagerKRTranslation(),
        es: new RecalculationManagerESTranslation(),
    };
}
