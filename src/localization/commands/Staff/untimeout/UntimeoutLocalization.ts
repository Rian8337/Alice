import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { UntimeoutENTranslation } from "./translations/UntimeoutENTranslation";
import { UntimeoutIDTranslation } from "./translations/UntimeoutIDTranslation";
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
        id: new UntimeoutIDTranslation(),
    };
}
