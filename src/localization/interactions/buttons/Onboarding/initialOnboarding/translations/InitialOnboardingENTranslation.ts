import { Translation } from "@alice-localization/base/Translation";
import { InitialOnboardingStrings } from "../InitialOnboardingLocalization";

/**
 * The English translation for the `initialOnboarding` button command.
 */
export class InitialOnboardingENTranslation extends Translation<InitialOnboardingStrings> {
    override readonly translations: InitialOnboardingStrings = {
        onboardingFeatureNotForUser:
            "I'm sorry, this introduction button is not for you!",
        welcomeToServer: "Welcome to the server!",
        accidentalDismissPrompt:
            "If this message was accidentally dismissed, feel free to restart the process from your welcome message.",
        botIntroduction:
            "I am %s, a bot created and maintained by %s and %s to assist osu!droid related conversations in the server.",
        onboardingPurpose:
            "This introduction feature is designed to allow you to grasp the core and most commonly used features that I offer.",
        beginOnboarding:
            "Begin by pressing any of the buttons below. They are ordered based on importance.",
        bindAccount: "Bind osu!droid account",
        recentPlays: "Show recent play(s)",
        scoreComparison: "Compare scores",
    };
}
