import { Translation } from "@localization/base/Translation";
import { EmojistatisticsStrings } from "../EmojistatisticsLocalization";

/**
 * The English translation for the `emojistatistics` command.
 */
export class EmojistatisticsENTranslation extends Translation<EmojistatisticsStrings> {
    override readonly translations: EmojistatisticsStrings = {
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
    };
}
