import { Translation } from "@localization/base/Translation";
import { CommandUtilManagerStrings } from "../CommandUtilManagerLocalization";

/**
 * The Korean translation for the `CommandUtilManager` manager utility.
 */
export class CommandUtilManagerKRTranslation extends Translation<CommandUtilManagerStrings> {
    override readonly translations: CommandUtilManagerStrings = {
        cooldownOutOfRange: "쿨다운은 5초에서 3600초 사이여야 함.",
        commandAlreadyDisabled: "명령어가 이미 비활성화됨",
    };
}
