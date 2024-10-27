import { Translation } from "@localization/base/Translation";
import { CommandHelperStrings } from "../CommandHelperLocalization";

/**
 * The Spanish translation for the `CommandHelper` helper utility.
 */
export class CommandHelperESTranslation extends Translation<CommandHelperStrings> {
    override readonly translations: CommandHelperStrings = {
        commandNotFound:
            "Lo siento, no puedo encontrar el comando que estas buscando!",
        permissionsRequired: "Necesitas estos permisos:",
    };
}
