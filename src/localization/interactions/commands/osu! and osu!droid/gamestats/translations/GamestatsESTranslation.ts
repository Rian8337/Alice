import { Translation } from "@alice-localization/base/Translation";
import { GamestatsStrings } from "../GamestatsLocalization";

/**
 * The Spanish translation for the `gamestats` command.
 */
export class GamestatsESTranslation extends Translation<GamestatsStrings> {
    override readonly translations: GamestatsStrings = {
        cannotRetrieveGameStatistics:
            "Lo siento, no puedo obtener las estadísticas del juego!",
        overallGameStats: "Estadísticas Generales",
        registeredAccounts: "Cuestas registradas",
        totalRegisteredAccounts: "Total",
        moreThan5ScoresAcc: "Más de 5 puntajes",
        moreThan20ScoresAcc: "Más de 20 puntajes",
        moreThan100ScoresAcc: "Más de 100 puntajes",
        moreThan200ScoresAcc: "Más de 200 puntajes",
        totalScores: "Total de puntajes",
    };
}
