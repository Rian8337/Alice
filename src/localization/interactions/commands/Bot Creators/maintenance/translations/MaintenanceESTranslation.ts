import { Translation } from "@localization/base/Translation";
import { MaintenanceStrings } from "../MaintenanceLocalization";

/**
 * The Spanish translation for the `maintenance` command.
 */
export class MaintenanceESTranslation extends Translation<MaintenanceStrings> {
    override readonly translations: MaintenanceStrings = {
        maintenanceToggle: "Maintenance mode has been set to `%s` for `%s`.",
    };
}
