import { Translation } from "@alice-localization/base/Translation";
import { RunModalSubmitStrings } from "../RunModalSubmitLocalization";

/**
 * The Korean translation for the `runModalSubmit` event utility for `interactionCreate` event.
 */
export class RunModalSubmitKRTranslation extends Translation<RunModalSubmitStrings> {
    override readonly translations: RunModalSubmitStrings = {
        debugModeActive:
            "죄송해요, 전 지금 디버그 모드에요. 오직 봇 소유자들의 명령어만 받을 수 있어요!",
        commandNotFound: "죄송해요, 그런 이름의 명령어를 찾지 못했어요.",
        maintenanceMode:
            "죄송해요, 전 다음 이유로 점검중이에요: `%s`. 나중에 다시 시도해 주세요!",
        commandExecutionFailed: "명령어 실행 불가: %s",
    };
}
