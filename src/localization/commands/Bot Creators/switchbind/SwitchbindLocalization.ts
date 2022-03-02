import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { SwitchbindENTranslation } from "./translations/SwitchbindENTranslation";
import { SwitchbindESTranslation } from "./translations/SwitchbindESTranslation";
import { SwitchbindIDTranslation } from "./translations/SwitchbindIDTranslation";
import { SwitchbindKRTranslation } from "./translations/SwitchbindKRTranslation";

export interface SwitchbindStrings {
    readonly invalidUid: string;
    readonly uidNotBinded: string;
    readonly switchFailed: string;
    readonly switchSuccessful: string;
}

/**
 * Localizations for the `switchbind` command.
 */
export class SwitchbindLocalization extends Localization<SwitchbindStrings> {
    protected override readonly localizations: Readonly<
        Translations<SwitchbindStrings>
    > = {
        en: new SwitchbindENTranslation(),
        kr: new SwitchbindKRTranslation(),
        id: new SwitchbindIDTranslation(),
        es: new SwitchbindESTranslation(),
    };
}
