import { Translation } from "@localization/base/Translation";
import { userMention } from "discord.js";
import { HelpStrings } from "../HelpLocalization";

/**
 * The Korean translation for the `help` command.
 */
export class HelpKRTranslation extends Translation<HelpStrings> {
    override readonly translations: HelpStrings = {
        noCommandFound: "죄송해요, 그런 명령어를 찾을 수 없어요!",
        mahiruHelp: "Mahiru Shiina 도움말",
        creator: `제작자: ${userMention("132783516176875520")}, ${userMention(
            "386742340968120321",
        )}.`,
        useHelpCommand:
            "명령어에 관한 더 자세한 정보를 알고 싶으시면, `/help [명령어 이름]`을 사용하세요.",
        issuesContact:
            "봇에 버그나 문제사항이 발견되면, 봇 제작자에게 연락해 주세요.",
        category: "카테고리",
        requiredPermissions: "요구 권한",
        examples: "예시",
        usage: "사용법",
        required: "필수",
        optional: "선택",
        details: "상세 정보",
        none: "없음",
    };
}
