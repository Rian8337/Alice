import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { AccountRebindTicketPresetProcessorENTranslation } from "./translations/AccountRebindTicketPresetProcessorENTranslation";

export interface AccountRebindTicketPresetProcessorStrings {
    readonly playerNotFound: string;
    readonly incorrectEmail: string;
    readonly accountNotBound: string;
    readonly cannotRebindToSameAccount: string;
}

/**
 * Localizations for the `AccountRebindTicketPresetProcessor` utility.
 */
export class AccountRebindTicketPresetProcessorLocalization extends Localization<AccountRebindTicketPresetProcessorStrings> {
    protected override readonly localizations: Readonly<
        Translations<AccountRebindTicketPresetProcessorStrings>
    > = {
        en: new AccountRebindTicketPresetProcessorENTranslation(),
    };
}
