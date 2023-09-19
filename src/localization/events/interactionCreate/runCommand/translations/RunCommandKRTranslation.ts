import { Translation } from "@alice-localization/base/Translation";
import { RunCommandStrings } from "../RunCommandLocalization";

/**
 * The Korean translation for the `runCommand` event utility for `interactionCreate` event.
 */
export class RunCommandKRTranslation extends Translation<RunCommandStrings> {
    override readonly translations: RunCommandStrings = {
        debugModeActive:
            "죄송해요, 전 지금 디버그 모드에요. 오직 봇 소유자들의 명령어만 받을 수 있어요!",
        commandNotFound: "죄송해요, 그런 이름의 명령어를 찾지 못했어요.",
        maintenanceMode:
            "죄송해요, 전 다음 이유로 점검중이에요: `%s`. 나중에 다시 시도해 주세요!",
        commandNotExecutableInChannel:
            "죄송해요, 해당 명령어는 이 채널에서 사용할 수 없어요.",
        requiredPermissions: "이 권한들이 필요해요: %s",
        commandInCooldown:
            "저기, 명령어를 천천히 사용해 주세요! 아시다시피, 저도 좀 쉬어야죠.",
        commandExecutionFailed:
            "죄송합니다, 명령을 처리하는 중에 오류가 발생했습니다.",
    };
}
