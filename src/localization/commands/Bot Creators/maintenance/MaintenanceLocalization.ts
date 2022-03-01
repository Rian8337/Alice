import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { MaintenanceENTranslation } from "./translations/MaintenanceENTranslation";
import { MaintenanceIDTranslation } from "./translations/MaintenanceIDTranslation";
import { MaintenanceKRTranslation } from "./translations/MaintenanceKRTranslation";

export interface MaintenanceStrings {
    readonly maintenanceToggle: string;
}

/**
 * Localizations for the `maintenance` command.
 */
export class MaintenanceLocalization extends Localization<MaintenanceStrings> {
    protected override readonly localizations: Readonly<
        Translations<MaintenanceStrings>
    > = {
        en: new MaintenanceENTranslation(),
        kr: new MaintenanceKRTranslation(),
        id: new MaintenanceIDTranslation(),
    };
}
