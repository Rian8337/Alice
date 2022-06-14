import { Translation } from "@alice-localization/base/Translation";
import { LeaderboardStrings } from "../LeaderboardLocalization";

/**
 * The Korean translation for the `leaderboard` command.
 */
export class LeaderboardKRTranslation extends Translation<LeaderboardStrings> {
    override readonly translations: LeaderboardStrings = {
        invalidPage: "저기, 유효한 페이지를 입력해 주세요!",
        dppLeaderboardClanNotFound: "죄송해요, 클랜을 찾을 수 없네요!",
        noPrototypeEntriesFound:
            "죄송해요, 현재 프로토타입 dpp 데이터베이스에 기록이 없네요!",
        noBeatmapFound: "저기, 유효한 비트맵 ID나 링크를 입력해 주세요!",
        username: "유저네임",
        uid: "UID",
        playCount: "플레이",
        pp: "PP",
        accuracy: "정확도",
        score: "점수",
    };
}
