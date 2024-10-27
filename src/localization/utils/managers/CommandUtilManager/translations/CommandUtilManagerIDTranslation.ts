import { Translation } from "@localization/base/Translation";
import { CommandUtilManagerStrings } from "../CommandUtilManagerLocalization";

/**
 * The Indonesian translation for the `CommandUtilManager` manager utility.
 */
export class CommandUtilManagerIDTranslation extends Translation<CommandUtilManagerStrings> {
    override readonly translations: CommandUtilManagerStrings = {
        cooldownOutOfRange: "",
        commandAlreadyDisabled: "",
    };
}
