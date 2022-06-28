import { Translation } from "@alice-localization/base/Translation";
import { DeployStrings } from "../DeployLocalization";

/**
 * The Korean translation of the `deploy` command.
 */
export class DeployKRTranslation extends Translation<DeployStrings> {
    override readonly translations: DeployStrings = {
        commandNotFound: "죄송해요, 그런 이름의 명령어는 못 찾겠어요!",
        commandDeploySuccessful: "성공적으로 %s 명령어를 등록했어요.",
    };
}
