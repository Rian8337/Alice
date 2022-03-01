import { Translation } from "@alice-localization/base/Translation";
import { MaintenanceStrings } from "../MaintenanceLocalization";

/**
 * The Indonesian translation for the `maintenance` command.
 */
export class MaintenanceIDTranslation extends Translation<MaintenanceStrings> {
    override readonly translations: MaintenanceStrings = {
        maintenanceToggle:
            "Berhasil mengubah mode pemeliharaan ke `%s` dengan alasan `%s`.",
    };
}
