import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface FetchreplayStrings {
    readonly beatmapNotProvided: string;
    readonly selfScoreNotFound: string;
    readonly userScoreNotFound: string;
    readonly noReplayFound: string;
    readonly fetchReplayNoBeatmapSuccessful: string;
    readonly playInfo: string;
    readonly hitErrorInfo: string;
    readonly hitErrorAvg: string;
}

/**
 * Localizations for the `fetchreplay` command.
 */
export class FetchreplayLocalization extends Localization<FetchreplayStrings> {
    protected override readonly translations: Readonly<
        Translation<FetchreplayStrings>
    > = {
        en: {
            beatmapNotProvided:
                "Hey, please enter the beatmap that I need to fetch the replay from!",
            selfScoreNotFound:
                "I'm sorry, you do not have a score submitted on that beatmap!",
            userScoreNotFound:
                "I'm sorry, that player does not have a score submitted on that beatmap!",
            noReplayFound: "I'm sorry, I cannot find the replay of the score!",
            fetchReplayNoBeatmapSuccessful:
                "Successfully fetched replay.\n\nRank: %s\nScore: %s\nMax Combo: %sx\nAccuracy: %s% [%s/%s/%s/%s]",
            playInfo: "Play Information for %s",
            hitErrorInfo: "Hit Error Information",
            hitErrorAvg: "hit error avg",
        },
        kr: {
            beatmapNotProvided:
                "저기, 리플레이를 가져올 비트맵을 입력 해 주세요!",
            selfScoreNotFound:
                "죄송해요, 당신은 이 비트맵에 제출한 기록이 없어요!",
            userScoreNotFound:
                "죄송해요, 해당 uid는 이 비트맵에 제출한 기록이 없어요!",
            noReplayFound: "죄송해요, 기록의 리플레이를 찾을 수 없어요!",
            fetchReplayNoBeatmapSuccessful:
                "성공적으로 리플레이를 가져왔어요.\n\n랭크: %s\n점수: %s\n최대 콤보: %sx\n정확도: %s% [%s/%s/%s/%s]",
            playInfo: "",
            hitErrorInfo: "",
            hitErrorAvg: "",
        },
    };
}
