import { Translation } from "@alice-localization/base/Translation";
import { LeaderboardStrings } from "../LeaderboardLocalization";

/**
 * The Spanish translation for the `leaderboard` command.
 */
export class LeaderboardESTranslation extends Translation<LeaderboardStrings> {
    override readonly translations: LeaderboardStrings = {
        invalidPage: "Hey, por favor ingresa una página valida!",
        dppLeaderboardClanNotFound: "Lo siento, no puedo encontrar el clan!",
        noPrototypeEntriesFound:
            "Lo siento, no hay ningún puntaje en la base de prueba de dpp de momento!",
        noBeatmapFound: "Hey, por favor ingresa un link o ID válido del mapa!",
        beatmapHasNoScores: "Lo siento, este mapa no tiene ningún puntaje!",
        topScore: "Puntaje más alto",
        username: "Nick",
        uid: "UID",
        playCount: "Play",
        pp: "PP",
        accuracy: "Precisión",
        score: "Puntaje",
    };
}
