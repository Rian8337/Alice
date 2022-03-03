import { Translation } from "@alice-localization/base/Translation";
import { PunishmentManagerStrings } from "../PunishmentManagerLocalization";

/**
 * The Spanish translation for the `PunishmentManager` manager utility.
 */
export class PunishmentManagerESTranslation extends Translation<PunishmentManagerStrings> {
    override readonly translations: PunishmentManagerStrings = {
        cannotFindLogChannel:
            "No es posible encontrar el canal de registros del servidor",
        invalidLogChannel:
            "El canal de registro del servidor no es un canal de texto",
    };
}
