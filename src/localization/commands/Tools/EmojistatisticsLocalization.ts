import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface EmojistatisticsStrings {
    readonly serverHasNoData: string;
    readonly noValidEmojis: string;
    readonly emojiStatisticsForServer: string;
    readonly sortMode: string;
    readonly overall: string;
    readonly averagePerMonth: string;
    readonly emoji: string;
    readonly dateCreation: string;
    readonly overallUsage: string;
    readonly averagePerMonthUsage: string;
}

/**
 * Localizations for the `emojistatistics` command.
 */
export class EmojistatisticsLocalization extends Localization<EmojistatisticsStrings> {
    protected override readonly translations: Readonly<
        Translation<EmojistatisticsStrings>
    > = {
        en: {
            serverHasNoData:
                "I'm sorry, this server has no emoji usage statistics!",
            noValidEmojis: "I'm sorry, I couldn't find any valid emojis!",
            emojiStatisticsForServer: "Emoji Statistics for %s",
            sortMode: "Sort Mode",
            overall: "Overall",
            averagePerMonth: "Average per month",
            emoji: "Emoji",
            dateCreation: "Date Creation",
            overallUsage: "Overall Usage",
            averagePerMonthUsage: "Average Per Month Usage",
        },
        kr: {
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
        },
    };
}
