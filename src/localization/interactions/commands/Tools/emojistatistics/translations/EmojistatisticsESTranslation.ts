import { Translation } from "@localization/base/Translation";
import { EmojistatisticsStrings } from "../EmojistatisticsLocalization";

/**
 * The Spanish translation for the `emojistatistics` command.
 */
export class EmojistatisticsESTranslation extends Translation<EmojistatisticsStrings> {
    override readonly translations: EmojistatisticsStrings = {
        serverHasNoData:
            "Lo siento, este servidor no tiene estadisticas del uso de emojis!",
        noValidEmojis: "Lo siento, no pude encontrar ningun emoji valido!",
        emojiStatisticsForServer: "Estadisticas para %s",
        sortMode: "Orden",
        overall: "General",
        averagePerMonth: "Promedio por mes",
        emoji: "Emoji",
        dateCreation: "Fecha de creación",
        overallUsage: "Uso general",
        averagePerMonthUsage: "Promedio de uso mensual",
    };
}
