import { Translation } from "@alice-localization/base/Translation";
import { SpamAccountKickStrings } from "../SpamAccountKickLocalization";

/**
 * The English translation for the `spamAccountKick` button command.
 */
export class SpamAccountKickENTranslation extends Translation<SpamAccountKickStrings> {
    override readonly translations: SpamAccountKickStrings = {
        userNotFound: "I'm sorry, this user is not in the server!",
        confirmKick: "Are you sure you want to kick %s?",
        kickSuccess: "Successfully kicked %s.",
        kickFailed:
            "I'm sorry, I couldn't kick %s. Perhaps they have a higher role than me?",
    };
}
