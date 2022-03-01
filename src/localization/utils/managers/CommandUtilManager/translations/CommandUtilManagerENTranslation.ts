import { Translation } from "@alice-localization/base/Translation";
import { CommandUtilManagerStrings } from "../CommandUtilManagerLocalization";

/**
 * The English translation for the `CommandUtilManager` manager utility.
 */
export class CommandUtilManagerENTranslation extends Translation<CommandUtilManagerStrings> {
    override readonly translations: CommandUtilManagerStrings = {
        cooldownOutOfRange: "cooldown must be between 5 and 3600 seconds",
        commandAlreadyDisabled: "command is already disabled",
    };
}
