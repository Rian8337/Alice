import { Translation } from "@alice-localization/base/Translation";
import { Recent5Strings } from "../Recent5Localization";

/**
 * The Spanish translation for the `recent5` command.
 */
export class Recent5ESTranslation extends Translation<Recent5Strings> {
    override readonly translations: Recent5Strings = {
        tooManyOptions:
            "Lo siento, solo puedes especificar un uid, usuario o nick! No puedes combinarlos!",
        playerNotFound:
            "Lo siento, no puedo encontrar el jugador que estas buscando!",
        playerHasNoRecentPlays:
            "Lo siento, este jugador no tiene ningun puntaje!",
    };
}
