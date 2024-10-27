import { Translation } from "@localization/base/Translation";
import { PunishmentManagerStrings } from "../PunishmentManagerLocalization";

/**
 * The English translation for the `PunishmentManager` manager utility.
 */
export class PunishmentManagerENTranslation extends Translation<PunishmentManagerStrings> {
    override readonly translations: PunishmentManagerStrings = {
        cannotFindLogChannel: "Unable to find the server log channel",
        invalidLogChannel: "The server's log channel is not a text channel",
    };
}
