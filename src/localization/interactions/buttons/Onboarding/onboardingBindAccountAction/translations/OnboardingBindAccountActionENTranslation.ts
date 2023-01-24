import { Translation } from "@alice-localization/base/Translation";
import { OnboardingBindAccountActionStrings } from "../OnboardingBindAccountActionLocalization";

/**
 * The English translation for the `bindAccountAction` button command.
 */
export class OnboardingBindAccountActionENTranslation extends Translation<OnboardingBindAccountActionStrings> {
    override readonly translations: OnboardingBindAccountActionStrings = {
        bindModalTitle: "Bind an osu!droid account",
        bindModalEmailLabel: "Email",
        bindModalEmailPlaceholder:
            "The email currently connected to your osu!droid account.",
        bindModalUsernameLabel: "Username",
        bindModalUsernamePlaceholder: "The username of your osu!droid account.",
    };
}
