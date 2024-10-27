import { Translation } from "@localization/base/Translation";
import { SimulateStrings } from "../SimulateLocalization";

/**
 * The Spanish translation for the `simulate` command.
 */
export class SimulateESTranslation extends Translation<SimulateStrings> {
    override readonly translations: SimulateStrings = {
        noSimulateOptions: "",
        tooManyOptions:
            "Lo siento, solo puedes especificar un uid, usuario o nick! No puedes combinarlos!",
        playerNotFound:
            "Lo siento, no puedo encontrar el jugador que estas buscando!",
        playerHasNoRecentPlays:
            "Lo siento, este jugador no tiene ningun puntaje!",
        noBeatmapProvided:
            "Hey, no hay ningun mapa siendo tema de conversación en este canal! Por favor, envia uno!",
        beatmapProvidedIsInvalid: "Hey, por favor envia un mapa válido!",
        beatmapNotFound:
            "Lo siento, no puedo encontrar el mapa que estas buscando!",
        selfScoreNotFound:
            "Lo siento, no tienes ninguna puntuación en este mapa!",
        userScoreNotFound:
            "Lo siento, este usuario no tiene ninguna puntuación en esta mapa!",
        simulatedPlayDisplay: "",
    };
}
