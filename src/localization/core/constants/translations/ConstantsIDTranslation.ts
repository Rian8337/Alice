import { Translation } from "@alice-localization/base/Translation";
import { ConstantsStrings } from "../ConstantsLocalization";

/**
 * The Indonesian translation for the `Constants` core class.
 */
export class ConstantsIDTranslation extends Translation<ConstantsStrings> {
    override readonly translations: ConstantsStrings = {
        noPermissionToExecuteCommand: "",
        selfAccountNotBinded: "",
        commandNotAvailableInServer: "",
        commandNotAvailableInChannel: "",
        userAccountNotBinded: "",
    };
}
