import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { RecalculationManagerENTranslation } from "./translations/RecalculationManagerENTranslation";
import { RecalculationManagerESTranslation } from "./translations/RecalculationManagerESTranslation";
import { RecalculationManagerIDTranslation } from "./translations/RecalculationManagerIDTranslation";
import { RecalculationManagerKRTranslation } from "./translations/RecalculationManagerKRTranslation";

export interface RecalculationManagerStrings {
    readonly recalculationSuccessful: string;
    readonly recalculationFailed: string;
    readonly userNotBinded: string;
    readonly userHasAskedForRecalc: string;
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
        id: new RecalculationManagerIDTranslation(),
        es: new RecalculationManagerESTranslation(),
    };
}
