import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface ConstantsStrings {
    readonly noPermissionToExecuteCommand: string;
    readonly selfAccountNotBinded: string;
    readonly commandNotAvailableInServer: string;
    readonly commandNotAvailableInChannel: string;
    readonly userAccountNotBinded: string;
}

/**
 * Localizations for the `Constants` core class.
 */
export class ConstantsLocalization extends Localization<ConstantsStrings> {
    protected override readonly translations: Readonly<
        Translation<ConstantsStrings>
    > = {
        en: {
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
        },
    };
}
