import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface RunCommandStrings {
    readonly debugModeActive: string;
    readonly commandNotFound: string;
    readonly maintenanceMode: string;
    readonly commandNotExecutableInChannel: string;
    readonly requiredPermissions: string;
    readonly commandInCooldown: string;
    readonly commandExecutionFailed: string;
}

/**
 * Localizations for the `runCommand` event utility for `interactionCreate` event.
 */
export class RunCommandLocalization extends Localization<RunCommandStrings> {
    protected override readonly translations: Readonly<
        Translation<RunCommandStrings>
    > = {
        en: {
            debugModeActive:
                "I'm sorry, I'm in debug mode now. I cannot accept commands from anyone beside bot owners!",
            commandNotFound:
                "I'm sorry, I cannot find the command with that name.",
            maintenanceMode:
                "I'm sorry, I'm currently under maintenance due to `%s`. Please try again later!",
            commandNotExecutableInChannel:
                "I'm sorry, this command is not executable in this channel.",
            requiredPermissions: "You need these permissions:",
            commandInCooldown:
                "Hey, calm down with the command! I need to rest too, you know.",
            commandExecutionFailed: "Unable to execute command: %s",
        },
        kr: {
            debugModeActive:
                "죄송해요, 전 지금 디버그 모드에요. 오직 봇 소유자들의 명령어만 받을 수 있어요!",
            commandNotFound: "죄송해요, 그런 이름의 명령어를 찾지 못했어요.",
            maintenanceMode:
                "죄송해요, 전 다음 이유로 점검중이에요: `%s`. 나중에 다시 시도해 주세요!",
            commandNotExecutableInChannel:
                "죄송해요, 해당 명령어는 이 채널에서 사용할 수 없어요.",
            requiredPermissions: "이 권한들이 필요해요:",
            commandInCooldown:
                "저기, 명령어를 천천히 사용해 주세요! 아시다시피, 저도 좀 쉬어야죠.",
            commandExecutionFailed: "명령어 실행 불가: %s",
        },
        id: {
            debugModeActive: "",
            commandNotFound: "",
            maintenanceMode: "",
            commandNotExecutableInChannel: "",
            requiredPermissions: "",
            commandInCooldown: "",
            commandExecutionFailed: "",
        },
    };
}
