import { Translation } from "@alice-localization/base/Translation";
import { AccountRebindTicketPresetValidatorStrings } from "../AccountRebindTicketPresetValidatorLocalization";

/**
 * The English translation for the `AccountRebindTicketPresetValidator` utility.
 */
export class AccountRebindTicketPresetValidatorENTranslation extends Translation<AccountRebindTicketPresetValidatorStrings> {
    override readonly translations: AccountRebindTicketPresetValidatorStrings =
        {
            bindLimitReached:
                "I'm sorry, you cannot bind another osu!droid account as you have reached the bind limit!",
        };
}
