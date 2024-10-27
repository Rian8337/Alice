import { Translation } from "@localization/base/Translation";
import { TournamentMatchStrings } from "../TournamentMatchLocalization";

/**
 * The Spanish translation for the `TournamentMatch` database utility.
 */
export class TournamentMatchESTranslation extends Translation<TournamentMatchStrings> {
    override readonly translations: TournamentMatchStrings = {
        scoreNotFound: "Puntaje no encontrado",
        modsIsNotUsed: "%s no es usado",
        replayNotFound: "Repetición no encontrada",
        unsupportedGameVersion: "version de osu!droid incompatible",
        modsExceptNotUsed: "Otros mods, excepto %s fueron usados",
        modsWasUsed: "%s fue usado",
        teamMembersIncorrectFMmod: "Ningún miembro del equipo activó HD/HR/EZ",
    };
}
