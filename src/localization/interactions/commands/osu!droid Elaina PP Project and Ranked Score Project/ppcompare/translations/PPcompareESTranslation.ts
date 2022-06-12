import { Translation } from "@alice-localization/base/Translation";
import { PPcompareStrings } from "../PPcompareLocalization";

export class PPcompareESTranslation extends Translation<PPcompareStrings> {
    override readonly translations: PPcompareStrings = {
        cannotCompareSamePlayers:
            "Hey, no puedes comparar 2 jugadores iguales!",
        playerNotBinded: 'Lo siento, el %s "%s" no esta enlazado!',
        uid: "uid",
        username: "nick",
        user: "usuario",
        noSimilarPlayFound:
            "Lo siento, los jugadores no tienen puntuaciones en comun para poder comparar!",
        topPlaysComparison: "Comparación de Top Plays (Rendimiento/PP)",
        player: "Jugador",
        totalPP: "PP total",
    };
}
