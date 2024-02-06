import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { AccountRebindTicketPresetValidatorENTranslation } from "./translations/AccountRebindTicketPresetValidatorENTranslation";

export interface AccountRebindTicketPresetValidatorStrings {
    readonly bindLimitReached: string;
}

/**
 * Localizations for the `AccountRebindTicketPresetValidator` utility.
 */
export class AccountRebindTicketPresetValidatorLocalization extends Localization<AccountRebindTicketPresetValidatorStrings> {
    protected override readonly localizations: Readonly<
        Translations<AccountRebindTicketPresetValidatorStrings>
    > = {
        en: new AccountRebindTicketPresetValidatorENTranslation(),
    };
}
