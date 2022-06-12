import { Translation } from "@alice-localization/base/Translation";
import { FetchreplayStrings } from "../FetchreplayLocalization";

/**
 * The Korean translation for the `fetchreplay` command.
 */
export class FetchreplayKRTranslation extends Translation<FetchreplayStrings> {
    override readonly translations: FetchreplayStrings = {
        beatmapNotProvided: "저기, 리플레이를 가져올 비트맵을 입력 해 주세요!",
        selfScoreNotFound: "죄송해요, 당신은 이 비트맵에 제출한 기록이 없어요!",
        userScoreNotFound:
            "죄송해요, 해당 uid는 이 비트맵에 제출한 기록이 없어요!",
        noReplayFound: "죄송해요, 기록의 리플레이를 찾을 수 없어요!",
        fetchReplayNoBeatmapSuccessful:
            "성공적으로 리플레이를 가져왔어요.\n\n랭크: %s\n점수: %s\n최대 콤보: %sx\n정확도: %s% [%s/%s/%s/%s]",
        playInfo: "%s의 플레이 정보",
        hitErrorInfo: "Hit Error 정보",
        hitErrorAvg: "hit error 평균",
    };
}
