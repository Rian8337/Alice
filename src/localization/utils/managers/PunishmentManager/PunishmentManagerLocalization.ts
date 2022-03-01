import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { PunishmentManagerENTranslation } from "./translations/PunishmentManagerENTranslation";
import { PunishmentManagerIDTranslation } from "./translations/PunishmentManagerIDTranslation";
import { PunishmentManagerKRTranslation } from "./translations/PunishmentManagerKRTranslation";

export interface PunishmentManagerStrings {
    readonly cannotFindLogChannel: string;
    readonly invalidLogChannel: string;
}

/**
 * Localizations for the `PunishmentManager` manager utility.
 */
export class PunishmentManagerLocalization extends Localization<PunishmentManagerStrings> {
    protected override readonly localizations: Readonly<
        Translations<PunishmentManagerStrings>
    > = {
        en: new PunishmentManagerENTranslation(),
        kr: new PunishmentManagerKRTranslation(),
        id: new PunishmentManagerIDTranslation(),
    };
}
