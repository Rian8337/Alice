import { Translation } from "@alice-localization/base/Translation";
import { ClanCheckStrings } from "../ClanCheckLocalization";

/**
 * The Korean translation for the `clanCheck` event utility for `guildMemberRemove` event.
 */
export class ClanCheckKRTranslation extends Translation<ClanCheckStrings> {
    override readonly translations: ClanCheckStrings = {
        memberKicked:
            "저기, 당신의 클랜 멤버 (%s) 가 서버를 떠나서 클랜에서 추방당했어요!",
    };
}
