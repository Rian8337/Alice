import { Translation } from "@alice-localization/base/Translation";
import { OnboardingShowRecentPlaysStrings } from "../OnboardingShowRecentPlaysLocalization";

/**
 * The English translation for the `onboardingShowRecentPlays` button command.
 */
export class OnboardingShowRecentPlaysENTranslation extends Translation<OnboardingShowRecentPlaysStrings> {
    override readonly translations: OnboardingShowRecentPlaysStrings = {
        userNotBinded:
            "I'm sorry, you have not binded an osu!droid account! Please follow the procedure outlined above to bind your osu!droid account.",
        profileNotFound: "I'm sorry, I cannot find your profile!",
        playerHasNoRecentPlays:
            "I'm sorry, this player has not submitted any scores!",
    };
}
