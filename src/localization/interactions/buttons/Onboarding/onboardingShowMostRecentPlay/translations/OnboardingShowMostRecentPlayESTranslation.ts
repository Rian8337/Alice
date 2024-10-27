import { Translation } from "@localization/base/Translation";
import { OnboardingShowMostRecentPlayStrings } from "../OnboardingShowMostRecentPlayLocalization";

/**
 * The Spanish translation for the `onboardingShowMostRecentPlay` button command.
 */
export class OnboardingShowMostRecentPlayESTranslation extends Translation<OnboardingShowMostRecentPlayStrings> {
    override readonly translations: OnboardingShowMostRecentPlayStrings = {
        userNotBinded: "",
        profileNotFound: "Lo siento, no puede encontrar tu perfil!",
        playerHasNoRecentPlays:
            "Lo siento, este jugador no tiene ningun puntaje!",
        recentPlayDisplay: "Puntaje reciente de %s:",
    };
}
