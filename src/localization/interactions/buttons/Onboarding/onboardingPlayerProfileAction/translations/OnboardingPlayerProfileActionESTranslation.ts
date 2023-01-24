import { Translation } from "@alice-localization/base/Translation";
import { OnboardingPlayerProfileActionStrings } from "../OnboardingPlayerProfileActionLocalization";

/**
 * The Spanish translation for the `onboardingPlayerProfileAction` button command.
 */
export class OnboardingPlayerProfileActionESTranslation extends Translation<OnboardingPlayerProfileActionStrings> {
    override readonly translations: OnboardingPlayerProfileActionStrings = {
        userNotBinded: "",
        profileNotFound: "Lo siento, no puede encontrar tu perfil!",
        viewingProfile: "Perfil de osu!droid de [%s](<%s>):",
    };
}
