import { Translation } from "@alice-localization/base/Translation";
import { ShowMostRecentPlayStrings } from "../ShowMostRecentPlayLocalization";

/**
 * The Spanish translation for the `showMostRecentPlay` button command.
 */
export class ShowMostRecentPlayESTranslation extends Translation<ShowMostRecentPlayStrings> {
    override readonly translations: ShowMostRecentPlayStrings = {
        userNotBinded: "",
        profileNotFound: "Lo siento, no puede encontrar tu perfil!",
        playerHasNoRecentPlays:
            "Lo siento, este jugador no tiene ningun puntaje!",
        recentPlayDisplay: "Puntaje reciente de %s:",
    };
}
