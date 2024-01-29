import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { CreateSupportTicketENTranslation } from "./translations/CreateSupportTicketENTranslation";

export interface CreateSupportTicketStrings {
    readonly modalTitle: string;
    readonly modalTitleLabel: string;
    readonly modalDescriptionLabel: string;
}

/**
 * Localizations for the `createSupportTicket` button command.
 */
export class CreateSupportTicketLocalization extends Localization<CreateSupportTicketStrings> {
    protected override readonly localizations: Readonly<
        Translations<CreateSupportTicketStrings>
    > = {
        en: new CreateSupportTicketENTranslation(),
    };
}
