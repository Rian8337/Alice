import { Translation } from "@alice-localization/base/Translation";
import { CompareScoreStrings } from "../CompareScoreLocalization";

/**
 * The Korean translation for the `compareScore` context menu command.
 */
export class CompareScoreKRTranslation extends Translation<CompareScoreStrings> {
    override readonly translations: CompareScoreStrings = {
        beatmapNotFound: "죄송해요, 찾으시려는 비트맵을 찾을 수 없었어요!",
        profileNotFound: "죄송해요, 당신의 프로필을 찾을 수 없었어요!",
        scoreNotFound: "죄송해요, 이 비트맵에 아무런 기록도 남기지 않으셨네요!",
        comparePlayDisplay: "%s의 플레이 비교:",
    };
}
