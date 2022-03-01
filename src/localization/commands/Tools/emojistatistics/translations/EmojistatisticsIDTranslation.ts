import { Translation } from "@alice-localization/base/Translation";
import { EmojistatisticsStrings } from "../EmojistatisticsLocalization";

/**
 * The Indonesian translation for the `emojistatistics` command.
 */
export class EmojistatisticsIDTranslation extends Translation<EmojistatisticsStrings> {
    override readonly translations: EmojistatisticsStrings = {
        serverHasNoData: "",
        noValidEmojis: "",
        emojiStatisticsForServer: "",
        sortMode: "",
        overall: "",
        averagePerMonth: "",
        emoji: "",
        dateCreation: "",
        overallUsage: "",
        averagePerMonthUsage: "",
    };
}
