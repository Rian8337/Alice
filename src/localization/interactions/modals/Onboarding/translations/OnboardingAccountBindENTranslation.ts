import { Translation } from "@alice-localization/base/Translation";
import { OnboardingAccountBindStrings } from "../OnboardingAccountBindLocalization";

/**
 * The English translation for the `onboardingAccountBind` modal command.
 */
export class OnboardingAccountBindENTranslation extends Translation<OnboardingAccountBindStrings> {
    override readonly translations: OnboardingAccountBindStrings = {
        profileNotFound: "I'm sorry, I couldn't find that account's profile!",
        incorrectEmail:
            "I'm sorry, the email you have entered is not associated with the account you're binding!",
        newAccountBindConfirmation:
            "Are you sure you want to bind your account to %s?",
        newAccountBindSuccessful:
            "Successfully bound your account to %s. You can bind %s more osu!droid account(s).",
        accountBindError: "I'm sorry, I couldn't bind your account to %s: %s.",
        accountHasBeenBindedError:
            "I'm sorry, that osu!droid account has been bound to another Discord account!",
        oldAccountBindSuccessful: "Successfully bound your account to %s.",
    };
}
