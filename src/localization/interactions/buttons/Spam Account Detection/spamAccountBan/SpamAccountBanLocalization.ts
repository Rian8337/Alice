import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { SpamAccountBanENTranslation } from "./translations/SpamAccountBanENTranslation";

export interface SpamAccountBanStrings {
    readonly userNotFound: string;
    readonly confirmBan: string;
    readonly banSuccess: string;
    readonly banFailed: string;
}

/**
 * Localizations for the `spamAccountBan` button command.
 */
export class SpamAccountBanLocalization extends Localization<SpamAccountBanStrings> {
    protected override readonly localizations: Readonly<
        Translations<SpamAccountBanStrings>
    > = {
        en: new SpamAccountBanENTranslation(),
    };
}
