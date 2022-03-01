import { Translation } from "@alice-localization/base/Translation";
import { ConstantsStrings } from "../ConstantsLocalization";

/**
 * The English translation for the `Constants` core class.
 */
export class ConstantsENTranslation extends Translation<ConstantsStrings> {
    override readonly translations: ConstantsStrings = {
        noPermissionToExecuteCommand:
            "I'm sorry, you do not have the permission to execute this command.",
        selfAccountNotBinded:
            "I'm sorry, your account is not binded. You need to bind your account using `/userbind` first.",
        commandNotAvailableInServer:
            "I'm sorry, this command is not available in this server.",
        commandNotAvailableInChannel:
            "I'm sorry, this command is not available in this channel.",
        userAccountNotBinded:
            "I'm sorry, that account is not binded. The user needs to bind his/her account using `/userbind` first.",
    };
}
