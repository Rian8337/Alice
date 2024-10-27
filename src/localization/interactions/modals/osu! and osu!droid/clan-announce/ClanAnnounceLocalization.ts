import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { ClanAnnounceENTranslation } from "./translations/ClanAnnounceENTranslation";
import { ClanAnnounceESTranslation } from "./translations/ClanAnnounceESTranslation";
import { ClanAnnounceKRTranslation } from "./translations/ClanAnnounceKRTranslation";

export interface ClanAnnounceStrings {
    readonly selfIsNotInClan: string;
    readonly selfHasNoAdministrativePermission: string;
    readonly announcementMessageConfirmation: string;
}

/**
 * Localizations for the `clan-announce` modal command.
 */
export class ClanAnnounceLocalization extends Localization<ClanAnnounceStrings> {
    protected override readonly localizations: Readonly<
        Translations<ClanAnnounceStrings>
    > = {
        en: new ClanAnnounceENTranslation(),
        es: new ClanAnnounceESTranslation(),
        kr: new ClanAnnounceKRTranslation(),
    };
}
