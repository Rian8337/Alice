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
        kr: {
            maintenanceToggle:
                "%s에 다음과 같은 이유로 점검 모드가 적용되었어요: %s",
        },
    };
}
