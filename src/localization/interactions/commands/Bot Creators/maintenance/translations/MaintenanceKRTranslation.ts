import { Translation } from "@alice-localization/base/Translation";
import { MaintenanceStrings } from "../MaintenanceLocalization";

/**
 * The Korean translation for the `maintenance` command.
 */
export class MaintenanceKRTranslation extends Translation<MaintenanceStrings> {
    override readonly translations: MaintenanceStrings = {
        maintenanceToggle:
            "`%s`에 다음과 같은 이유로 점검 모드가 적용되었어요: `%s`",
    };
}
