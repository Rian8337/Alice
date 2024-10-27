import { Translation } from "@localization/base/Translation";
import { UserbindStrings } from "../UserbindLocalization";

/**
 * The English translation for the `userbind` command.
 */
export class UserbindENTranslation extends Translation<UserbindStrings> {
    override readonly translations: UserbindStrings = {
        profileNotFound: "I'm sorry, I couldn't find that account's profile!",
        newAccountBindNotInMainServer:
            "I'm sorry, new account binding must be done in the osu!droid International Discord server! This is required to keep bind moderation at ease.",
        emailNotSpecified:
            "I'm sorry, you must enter the account's email if you want to bind it for the first time!",
        incorrectEmail:
            "I'm sorry, the email you have entered is not associated with the account you're binding!",
        newAccountUidBindConfirmation:
            "Are you sure you want to bind your account to uid %s?",
        newAccountUsernameBindConfirmation:
            "Are you sure you want to bind your account to username %s?",
        newAccountUidBindSuccessful:
            "Successfully bound your account to uid %s. You can bind %s more osu!droid account(s).",
        newAccountUsernameBindSuccessful:
            "Successfully bound your account to username %s. You can bind %s more osu!droid account(s).",
        accountUidBindError:
            "I'm sorry, I couldn't bind your account to uid %s: %s.",
        accountUsernameBindError:
            "I'm sorry, I couldn't bind your account to username %s: %s.",
        accountHasBeenBindedError:
            "I'm sorry, that osu!droid account has been bound to another Discord account!",
        oldAccountUidBindSuccessful:
            "Successfully bound your account to uid %s.",
        oldAccountUsernameBindSuccessful:
            "Successfully bound your account to username %s.",
    };
}
