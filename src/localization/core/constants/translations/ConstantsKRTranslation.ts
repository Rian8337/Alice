import { Translation } from "@localization/base/Translation";
import { chatInputApplicationCommandMention } from "discord.js";
import { ConstantsStrings } from "../ConstantsLocalization";

/**
 * The Korean translation for the `Constants` core class.
 */
export class ConstantsKRTranslation extends Translation<ConstantsStrings> {
    override readonly translations: ConstantsStrings = {
        noPermissionToExecuteCommand:
            "죄송해요, 이 명령어를 실행할 권한이 없어요.",
        selfAccountNotBinded: `죄송해요, 당신의 계정은 바인딩 되어있지 않아요. 먼저 ${chatInputApplicationCommandMention(
            "userbind",
            "username",
            "1302217968935108639",
        )}로 계정을 바인드 해야해요.`,
        commandNotAvailableInServer:
            "죄송해요, 이 명령어는 이 서버에서 사용할 수 없어요.",
        commandNotAvailableInChannel:
            "죄송해요, 이 명령어는 이 채널에서 사용할 수 없어요.",
        userAccountNotBinded: `죄송해요, 해당 계정은 바인드되어있지 않아요. 그 유저는 먼저 ${chatInputApplicationCommandMention(
            "userbind",
            "username",
            "1302217968935108639",
        )}로 계정을 바인드 해야해요.`,
    };
}
