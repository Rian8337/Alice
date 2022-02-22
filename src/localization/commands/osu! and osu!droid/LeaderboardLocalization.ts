import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface LeaderboardStrings {
    readonly invalidPage: string;
    readonly dppLeaderboardClanNotFound: string;
    readonly noPrototypeEntriesFound: string;
    readonly noBeatmapFound: string;
    readonly beatmapHasNoScores: string;
    readonly topScore: string;
    readonly username: string;
    readonly uid: string;
    readonly playCount: string;
    readonly pp: string;
    readonly accuracy: string;
    readonly score: string;
}

/**
 * Localizations for the `leaderboard` command.
 */
export class LeaderboardLocalization extends Localization<LeaderboardStrings> {
    protected override readonly translations: Readonly<
        Translation<LeaderboardStrings>
    > = {
        en: {
            invalidPage: "Hey, please enter a valid page!",
            dppLeaderboardClanNotFound: "I'm sorry, I cannot find the clan!",
            noPrototypeEntriesFound:
                "I'm sorry, there are no scores in the prototype dpp database as of now!",
            noBeatmapFound: "Hey, please enter a valid beatmap link or ID!",
            beatmapHasNoScores:
                "I'm sorry, this beatmap doesn't have any scores submitted!",
            topScore: "Top Score",
            username: "Username",
            uid: "UID",
            playCount: "Play",
            pp: "PP",
            accuracy: "Accuracy",
            score: "Score",
        },
        kr: {
            invalidPage: "저기, 유효한 페이지를 입력해 주세요!",
            dppLeaderboardClanNotFound: "죄송해요, 클랜을 찾을 수 없네요!",
            noPrototypeEntriesFound:
                "죄송해요, 현재 프로토타입 dpp 데이터베이스에 기록이 없네요!",
            noBeatmapFound: "저기, 유효한 비트맵 ID나 링크를 입력해 주세요!",
            beatmapHasNoScores: "죄송해요, 이 비트맵엔 제출된 기록이 없네요!",
            topScore: "1등 기록",
            username: "유저네임",
            uid: "UID",
            playCount: "플레이",
            pp: "PP",
            accuracy: "정확도",
            score: "점수",
        },
    };
}
