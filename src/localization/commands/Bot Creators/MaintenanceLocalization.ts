import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface MaintenanceStrings {
    readonly maintenanceToggle: string;
}

/**
 * Localizations for the `maintenance` command.
 */
export class MaintenanceLocalization extends Localization<MaintenanceStrings> {
    protected override readonly translations: Readonly<
        Translation<MaintenanceStrings>
    > = {
        en: {
            maintenanceToggle:
                "Maintenance mode has been set to `%s` for `%s`.",
        },
    };
}
