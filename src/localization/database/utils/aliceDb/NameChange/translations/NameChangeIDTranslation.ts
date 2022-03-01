import { Translation } from "@alice-localization/base/Translation";
import { NameChangeStrings } from "../NameChangeLocalization";

/**
 * The Indonesian translation for the `NameChange` database utility.
 */
export class NameChangeIDTranslation extends Translation<NameChangeStrings> {
    override readonly translations: NameChangeStrings = {
        requestNotActive: "",
        playerNotFound: "",
        droidServerRequestFailed: "",
        newUsernameTaken: "",
        requestDetails: "",
        currentUsername: "",
        requestedUsername: "",
        creationDate: "",
        status: "",
        accepted: "",
        acceptedNotification: "",
        denied: "",
        reason: "",
        deniedNotification: "",
    };
}
