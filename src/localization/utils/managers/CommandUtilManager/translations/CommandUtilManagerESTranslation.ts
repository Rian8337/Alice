import { Translation } from "@localization/base/Translation";
import { CommandUtilManagerStrings } from "../CommandUtilManagerLocalization";

/**
 * The Spanish translation for the `CommandUtilManager` manager utility.
 */
export class CommandUtilManagerESTranslation extends Translation<CommandUtilManagerStrings> {
    override readonly translations: CommandUtilManagerStrings = {
        cooldownOutOfRange:
            "El tiempo de espera debe ser entre 5 y 3600 segundos",
        commandAlreadyDisabled: "el comando ya se encuentra deshabilitado",
    };
}
