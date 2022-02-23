import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface HelpStrings {
    readonly noCommandFound: string;
    readonly aliceHelp: string;
    readonly creator: string;
    readonly useHelpCommand: string;
    readonly issuesContact: string;
    readonly category: string;
    readonly requiredPermissions: string;
    readonly examples: string;
    readonly usage: string;
    readonly required: string;
    readonly optional: string;
    readonly details: string;
    readonly none: string;
}

/**
 * Localizations for the `help` command.
 */
export class HelpLocalization extends Localization<HelpStrings> {
    protected override readonly translations: Readonly<
        Translation<HelpStrings>
    > = {
        en: {
            noCommandFound: "I'm sorry, I cannot find the command!",
            aliceHelp: "Alice Synthesis Thirty Help",
            creator: "Made by <@132783516176875520> and <@386742340968120321>.",
            useHelpCommand:
                "For detailed information about a command, use `/help [command name]`.",
            issuesContact:
                "If you encounter any bugs or issues with the bot, please contact bot creators.",
            category: "Category",
            requiredPermissions: "Required Permissions",
            examples: "Examples",
            usage: "Usage",
            required: "Required",
            optional: "Optional",
            details: "Details",
            none: "None",
        },
        kr: {
            noCommandFound: "죄송해요, 그런 명령어를 찾을 수 없어요!",
            aliceHelp: "Alice Synthesis Thirty 도움말",
            creator: "제작자: <@132783516176875520>, <@386742340968120321>.",
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
        },
        id: {
            noCommandFound: "",
            aliceHelp: "",
            creator: "",
            useHelpCommand: "",
            issuesContact: "",
            category: "",
            requiredPermissions: "",
            examples: "",
            usage: "",
            required: "",
            optional: "",
            details: "",
            none: "",
        },
    };
}
