import { Translation } from "@alice-localization/base/Translation";
import { RecentStrings } from "../RecentLocalization";

/**
 * The Spanish translation for the `recent` command.
 */
export class RecentESTranslation extends Translation<RecentStrings> {
    override readonly translations: RecentStrings = {
        tooManyOptions:
            "Lo siento, solo puedes especificar un uid, usuario o nick! No puedes combinarlos!",
        playerNotFound:
            "Lo siento, no puedo encontrar el jugador que estas buscando!",
        playerHasNoRecentPlays:
            "Lo siento, este jugador no tiene ningun puntaje!",
        playIndexOutOfBounds:
            "Lo siento, este jugador no tiene ningun puntaje reciente en la posición %s!",
        recentPlayDisplay: "Puntaje reciente de %s:",
    };
}
