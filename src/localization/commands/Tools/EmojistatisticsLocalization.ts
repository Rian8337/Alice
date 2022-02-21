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
    };
}
