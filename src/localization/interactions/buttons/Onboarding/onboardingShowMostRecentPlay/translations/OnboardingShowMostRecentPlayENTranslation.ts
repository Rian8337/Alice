import { Translation } from "@alice-localization/base/Translation";
import { OnboardingShowMostRecentPlayStrings } from "../OnboardingShowMostRecentPlayLocalization";

/**
 * The English translation for the `onboardingShowMostRecentPlay` button command.
 */
export class OnboardingShowMostRecentPlayENTranslation extends Translation<OnboardingShowMostRecentPlayStrings> {
    override readonly translations: OnboardingShowMostRecentPlayStrings = {
        userNotBinded:
            "I'm sorry, you have not bound an osu!droid account! Please follow the procedure outlined above to bind your osu!droid account.",
        profileNotFound: "I'm sorry, I cannot find your profile!",
        playerHasNoRecentPlays:
            "I'm sorry, this player has not submitted any scores!",
        recentPlayDisplay: "Recent play for %s:",
    };
}
