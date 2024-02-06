import { Translation } from "@alice-localization/base/Translation";
import { AccountRebindTicketPresetBuilderStrings } from "../AccountRebindTicketPresetBuilderLocalization";

/**
 * The English translation for the `AccountRebindTicketPresetBuilder` utility.
 */
export class AccountRebindTicketPresetBuilderENTranslation extends Translation<AccountRebindTicketPresetBuilderStrings> {
    override readonly translations: AccountRebindTicketPresetBuilderStrings = {
        usernameLabel: "osu!droid Account Username",
        emailPlaceholder: "Email of the osu!droid account entered above.",
        emailLabel: "osu!droid Account Email",
        reasonPlaceholder:
            "Your reason for moving the bind of the osu!droid account. Please be as specific as possible.",
        reasonLabel: "Reason",
    };
}
