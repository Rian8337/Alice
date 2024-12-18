import { Translation } from "@localization/base/Translation";
import { OnboardingShowRecentPlaysStrings } from "../OnboardingShowRecentPlaysLocalization";

/**
 * The Spanish translation for the `onboardingShowRecentPlays` button command.
 */
export class OnboardingShowRecentPlaysESTranslation extends Translation<OnboardingShowRecentPlaysStrings> {
    override readonly translations: OnboardingShowRecentPlaysStrings = {
        userNotBinded: "",
        profileNotFound: "Lo siento, no puede encontrar tu perfil!",
        playerHasNoRecentPlays:
            "Lo siento, este jugador no tiene ningun puntaje!",
    };
}
