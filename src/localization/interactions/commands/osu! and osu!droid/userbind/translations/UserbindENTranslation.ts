import { Translation } from "@localization/base/Translation";
import { UserbindStrings } from "../UserbindLocalization";

/**
 * The English translation for the `userbind` command.
 */
export class UserbindENTranslation extends Translation<UserbindStrings> {
    override readonly translations: UserbindStrings = {
        profileNotFound: "I'm sorry, I couldn't find that account's profile!",
        incorrectEmail:
            "I'm sorry, the email you have entered is not associated with the account you're binding!",
        bindConfirmation: "Are you sure you want to bind your account to %s?",
        discordAccountAlreadyBoundError:
            "I'm sorry, you have bound yourself to an osu!droid account.",
        accountHasBeenBoundError:
            "I'm sorry, that osu!droid account has been bound to another Discord account!",
        bindError: "I'm sorry, I couldn't bind your account: %s.",
        bindSuccessful: "Successfully bound your account to %s.",
    };
}
