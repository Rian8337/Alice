import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { UntimeoutENTranslation } from "./translations/UntimeoutENTranslation";
import { UntimeoutESTranslation } from "./translations/UntimeoutESTranslation";
import { UntimeoutKRTranslation } from "./translations/UntimeoutKRTranslation";

export interface UntimeoutStrings {
    readonly userCannotUntimeoutError: string;
    readonly untimeoutFailed: string;
    readonly untimeoutSuccessful: string;
}

/**
 * Localizations for the `untimeout` command.
 */
export class UntimeoutLocalization extends Localization<UntimeoutStrings> {
    protected override readonly localizations: Readonly<
        Translations<UntimeoutStrings>
    > = {
        en: new UntimeoutENTranslation(),
        kr: new UntimeoutKRTranslation(),
        es: new UntimeoutESTranslation(),
    };
}
