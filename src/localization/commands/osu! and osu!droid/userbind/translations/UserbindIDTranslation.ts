import { Translation } from "@alice-localization/base/Translation";
import { UserbindStrings } from "../UserbindLocalization";

/**
 * The Indonesian translation for the `userbind` command.
 */
export class UserbindIDTranslation extends Translation<UserbindStrings> {
    override readonly translations: UserbindStrings = {
        profileNotFound: "",
        verificationMapNotFound: "",
        newAccountBindNotInMainServer: "",
        newAccountBindNotVerified: "",
        newAccountUidBindConfirmation: "",
        newAccountUsernameBindConfirmation: "",
        newAccountUidBindSuccessful: "",
        newAccountUsernameBindSuccessful: "",
        accountUidBindError: "",
        accountUsernameBindError: "",
        accountHasBeenBindedError: "",
        oldAccountUidBindSuccessful: "",
        oldAccountUsernameBindSuccessful: "",
        verificationMapInformation: "",
    };
}
