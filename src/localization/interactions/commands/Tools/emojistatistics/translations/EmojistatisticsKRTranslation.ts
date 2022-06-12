import { Translation } from "@alice-localization/base/Translation";
import { EmojistatisticsStrings } from "../EmojistatisticsLocalization";

/**
 * The Korean translation for the `emojistatistics` command.
 */
export class EmojistatisticsKRTranslation extends Translation<EmojistatisticsStrings> {
    override readonly translations: EmojistatisticsStrings = {
        serverHasNoData: "죄송해요, 이 서버는 이모지 사용 통계가 없어요!",
        noValidEmojis: "죄송해요, 유효한 이모지를 하나도 찾지 못했어요!",
        emojiStatisticsForServer: "%s의 이모지 통계",
        sortMode: "정렬 기준",
        overall: "종합",
        averagePerMonth: "한달 평균",
        emoji: "이모지",
        dateCreation: "만들어진 날짜",
        overallUsage: "총 사용 횟수",
        averagePerMonthUsage: "한달 평균 사용 횟수",
    };
}
