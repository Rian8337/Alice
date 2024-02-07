import { Translation } from "@alice-localization/base/Translation";
import { OnboardingHomeStrings } from "../OnboardingHomeLocalization";

/**
 * The English translation for the `onboardingHome` button command.
 */
export class OnboardingHomeENTranslation extends Translation<OnboardingHomeStrings> {
    override readonly translations: OnboardingHomeStrings = {
        welcomeToServer: "Welcome to the server!",
        accidentalDismissPrompt:
            "If this message was accidentally dismissed, feel free to restart the process from your welcome message.",
        botIntroduction:
            "I am %s, a bot created and maintained by %s and %s to assist osu!droid related conversations in the server.",
        onboardingPurpose:
            "This introduction feature is designed to allow you to grasp the core and most commonly used features that I offer.",
        beginOnboarding:
            "Begin by pressing any of the buttons below. They are ordered based on priority.",
    };
}
