import { Translation } from "@localization/base/Translation";
import { CommandHelperStrings } from "../CommandHelperLocalization";

/**
 * The Korean translation for the `CommandHelper` helper utility.
 */
export class CommandHelperKRTranslation extends Translation<CommandHelperStrings> {
    override readonly translations: CommandHelperStrings = {
        commandNotFound: "죄송해요, 찾으시려는 명령어를 찾지 못했어요!",
        permissionsRequired: "이 권한들이 필요해요:",
    };
}
