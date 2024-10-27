import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { SpamAccountKickENTranslation } from "./translations/SpamAccountKickENTranslation";

export interface SpamAccountKickStrings {
    readonly userNotFound: string;
    readonly confirmKick: string;
    readonly kickSuccess: string;
    readonly kickFailed: string;
}

/**
 * Localizations for the `spamAccountKick` button command.
 */
export class SpamAccountKickLocalization extends Localization<SpamAccountKickStrings> {
    protected override readonly localizations: Readonly<
        Translations<SpamAccountKickStrings>
    > = {
        en: new SpamAccountKickENTranslation(),
    };
}
