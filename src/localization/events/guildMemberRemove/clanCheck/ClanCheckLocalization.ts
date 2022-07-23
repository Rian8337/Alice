import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { ClanCheckENTranslation } from "./translations/ClanCheckENTranslation";
import { ClanCheckESTranslation } from "./translations/ClanCheckESTranslation";
import { ClanCheckKRTranslation } from "./translations/ClanCheckKRTranslation";

export interface ClanCheckStrings {
    readonly memberKicked: string;
}

/**
 * Localizations for the `clanCheck` event utility for `guildMemberRemove` event.
 */
export class ClanCheckLocalization extends Localization<ClanCheckStrings> {
    protected override readonly localizations: Readonly<
        Translations<ClanCheckStrings>
    > = {
        en: new ClanCheckENTranslation(),
        kr: new ClanCheckKRTranslation(),
        es: new ClanCheckESTranslation(),
    };
}
