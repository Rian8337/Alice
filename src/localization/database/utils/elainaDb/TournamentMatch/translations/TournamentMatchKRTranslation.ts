import { Translation } from "@localization/base/Translation";
import { TournamentMatchStrings } from "../TournamentMatchLocalization";

/**
 * The Korean translation for the `TournamentMatch` database utility.
 */
export class TournamentMatchKRTranslation extends Translation<TournamentMatchStrings> {
    override readonly translations: TournamentMatchStrings = {
        scoreNotFound: "기록이 발견되지 않음",
        modsIsNotUsed: "%s(이)가 사용되지 않음",
        replayNotFound: "리플레이가 발견되지 않음",
        unsupportedGameVersion: "지원하지 않는 osu!droid 버전",
        modsExceptNotUsed: "%s(이)가 아닌 다른 모드가 사용됨",
        modsWasUsed: "%s(이)가 사용됨",
        teamMembersIncorrectFMmod:
            "팀 멤버중 아무도 HD/HR/EZ를 활성화하지 않음",
    };
}
