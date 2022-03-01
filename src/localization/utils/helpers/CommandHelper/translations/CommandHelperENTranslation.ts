import { Translation } from "@alice-localization/base/Translation";
import { CommandHelperStrings } from "../CommandHelperLocalization";

/**
 * The English translation for the `CommandHelper` helper utility.
 */
export class CommandHelperENTranslation extends Translation<CommandHelperStrings> {
    override readonly translations: CommandHelperStrings = {
        commandNotFound:
            "I'm sorry, I cannot find the command that you are looking for!",
        permissionsRequired: "You need these permissions:",
    };
}
