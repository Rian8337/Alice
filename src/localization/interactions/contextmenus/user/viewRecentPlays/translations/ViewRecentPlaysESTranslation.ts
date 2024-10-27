import { Translation } from "@localization/base/Translation";
import { ViewRecentPlaysStrings } from "../ViewRecentPlaysLocalization";

/**
 * The Spanish translation for the `viewRecentPlays` user context menu command.
 */
export class ViewRecentPlaysESTranslation extends Translation<ViewRecentPlaysStrings> {
    override readonly translations: ViewRecentPlaysStrings = {
        selfProfileNotFound: "Lo siento, no puede encontrar tu perfil!",
        userProfileNotFound:
            "Lo siento, no puede encontrar el perfil de ese jugador!",
        playerHasNoRecentPlays:
            "Lo siento, este jugador no tiene ningun puntaje!",
    };
}
