import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { AccountRebindTicketPresetBuilderENTranslation } from "./translations/AccountRebindTicketPresetBuilderENTranslation";

export interface AccountRebindTicketPresetBuilderStrings {
    readonly usernameLabel: string;
    readonly emailPlaceholder: string;
    readonly emailLabel: string;
    readonly reasonPlaceholder: string;
    readonly reasonLabel: string;
}

/**
 * Localizations for the `AccountRebindTicketPresetBuilder` utility.
 */
export class AccountRebindTicketPresetBuilderLocalization extends Localization<AccountRebindTicketPresetBuilderStrings> {
    protected override readonly localizations: Readonly<
        Translations<AccountRebindTicketPresetBuilderStrings>
    > = {
        en: new AccountRebindTicketPresetBuilderENTranslation(),
    };
}
