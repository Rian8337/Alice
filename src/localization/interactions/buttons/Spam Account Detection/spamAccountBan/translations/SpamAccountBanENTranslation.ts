import { Translation } from "@localization/base/Translation";
import { SpamAccountBanStrings } from "../SpamAccountBanLocalization";

/**
 * The English translation for the `spamAccountBan` button command.
 */
export class SpamAccountBanENTranslation extends Translation<SpamAccountBanStrings> {
    override readonly translations: SpamAccountBanStrings = {
        userNotFound: "I'm sorry, this user is not in the server!",
        confirmBan: "Are you sure you want to ban %s?",
        banSuccess: "Successfully banned %s.",
        banFailed:
            "I'm sorry, I couldn't ban %s. Perhaps they have a higher role than me?",
    };
}
