import { Translation } from "@localization/base/Translation";
import { PunishmentManagerStrings } from "../PunishmentManagerLocalization";

/**
 * The Indonesian translation for the `PunishmentManager` manager utility.
 */
export class PunishmentManagerIDTranslation extends Translation<PunishmentManagerStrings> {
    override readonly translations: PunishmentManagerStrings = {
        cannotFindLogChannel: "",
        invalidLogChannel: "",
    };
}
