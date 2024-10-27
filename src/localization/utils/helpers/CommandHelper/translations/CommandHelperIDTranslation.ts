import { Translation } from "@localization/base/Translation";
import { CommandHelperStrings } from "../CommandHelperLocalization";

/**
 * The Indonesian translation for the `CommandHelper` helper utility.
 */
export class CommandHelperIDTranslation extends Translation<CommandHelperStrings> {
    override readonly translations: CommandHelperStrings = {
        commandNotFound: "",
        permissionsRequired: "",
    };
}
