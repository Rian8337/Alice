import { Translation } from "@localization/base/Translation";
import { UndeployStrings } from "../UndeployLocalization";

/**
 * The Korean translation for the `undeploy` command.
 */
export class UndeployKRTranslation extends Translation<UndeployStrings> {
    override readonly translations: UndeployStrings = {
        commandNotFound: "죄송해요, 그런 이름의 명령어는 못 찾겠어요!",
        commandUndeploySuccessful: "성공적으로 %s 명령어를 등록 해제했어요.",
    };
}
