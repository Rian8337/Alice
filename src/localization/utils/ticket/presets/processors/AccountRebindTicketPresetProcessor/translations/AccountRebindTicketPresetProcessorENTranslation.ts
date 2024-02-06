import { Translation } from "@alice-localization/base/Translation";
import { AccountRebindTicketPresetProcessorStrings } from "../AccountRebindTicketPresetProcessorLocalization";

/**
 * The English translation for the `AccountRebindTicketPresetProcessor` utility.
 */
export class AccountRebindTicketPresetProcessorENTranslation extends Translation<AccountRebindTicketPresetProcessorStrings> {
    override readonly translations: AccountRebindTicketPresetProcessorStrings =
        {
            playerNotFound:
                "I'm sorry, I couldn't find that account's profile. For copying convenience, here was your reason:\n\n%s",
            incorrectEmail:
                "I'm sorry, the email you have entered is not associated with the osu!droid account you have entered. For copying convenience, here was your reason:\n\n%s",
            cannotRebindToSameAccount:
                "I'm sorry, the osu!droid account is already bound to your Discord account. For copying convenience, here was your reason:\n\n%s",
            accountNotBound:
                "I'm sorry, that osu!droid account is not bound to any Discord account. For copying convenience, here was your reason:\n\n%s",
        };
}
