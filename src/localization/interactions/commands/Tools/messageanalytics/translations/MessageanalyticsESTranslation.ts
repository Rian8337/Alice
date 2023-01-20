import { Translation } from "@alice-localization/base/Translation";
import { MessageanalyticsStrings } from "../MessageanalyticsLocalization";

/**
 * The Spanish translation for the `messageanalytics` command.
 */
export class MessageanalyticsESTranslation extends Translation<MessageanalyticsStrings> {
    override readonly translations: MessageanalyticsStrings = {
        incorrectDateFormat:
            "Hey, por favor ingresa un formato de fecha válido!",
        dateBeforeGuildCreationError:
            "Hey, el servidor no existía para entonces!",
        dateHasntPassed: "Vienes del futuro no? Lamentablemente yo no.",
        noActivityDataOnDate:
            "Lo siento, no hay información de actividad en esta fecha!",
        channelIsFiltered:
            "Lo siento, este canal esta fuera del analisis de mensajes!",
        notATextChannel:
            "Lo siento, solo puede utilizar ese comando en un canal de texto!",
        messageFetchStarted: "Analisis de mensajes iniciado correctamente.",
        messageFetchDone: "%s, analisis finalizado!",
        messageCount: "mensajes",
        wordsCount: "",
        generalChannels: "Canales Generales",
        languageChannels: "Canales por Lenguaje",
        clanChannels: "Canales de Clan",
        channelActivity: "Actividad del canal hasta %s",
        overall: "Total",
        monthly: "Mensual",
        daily: "Diario",
    };
}
