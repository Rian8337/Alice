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
        kr: {
            noPermissionToExecuteCommand:
                "죄송해요, 이 명령어를 실행할 권한이 없어요.",
            selfAccountNotBinded:
                "죄송해요, 당신의 계정은 바인딩 되어있지 않아요. 먼저 `/userbind`로 계정을 바인드 해야해요.",
            commandNotAvailableInServer:
                "죄송해요, 이 명령어는 이 서버에서 사용할 수 없어요.",
            commandNotAvailableInChannel:
                "죄송해요, 이 명령어는 이 채널에서 사용할 수 없어요.",
            userAccountNotBinded:
                "죄송해요, 해당 계정은 바인드되어있지 않아요. 그 유저는 먼저 `/userbind`로 계정을 바인드 해야해요.",
        },
    };
}
