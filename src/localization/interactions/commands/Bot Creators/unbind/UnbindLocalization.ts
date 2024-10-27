import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { UnbindENTranslation } from "./translations/UnbindENTranslation";
import { UnbindESTranslation } from "./translations/UnbindESTranslation";
import { UnbindIDTranslation } from "./translations/UnbindIDTranslation";
import { UnbindKRTranslation } from "./translations/UnbindKRTranslation";

export interface UnbindStrings {
    readonly invalidUid: string;
    readonly uidNotBinded: string;
    readonly unbindFailed: string;
    readonly unbindSuccessful: string;
}

/**
 * Localizations for the `unbind` command.
 */
export class UnbindLocalization extends Localization<UnbindStrings> {
    protected override readonly localizations: Readonly<
        Translations<UnbindStrings>
    > = {
        en: new UnbindENTranslation(),
        kr: new UnbindKRTranslation(),
        id: new UnbindIDTranslation(),
        es: new UnbindESTranslation(),
    };
}
