import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { TicketENTranslation } from "./translations/TicketENTranslation";

export interface TicketStrings {
    readonly ticketNotFound: string;
    readonly ticketEditModalTitle: string;
    readonly ticketCreateModalTitle: string;
    readonly ticketModalTitleLabel: string;
    readonly ticketModalDescriptionLabel: string;
    readonly closeTicketFailed: string;
    readonly closeTicketSuccess: string;
    readonly reopenTicketFailed: string;
    readonly reopenTicketSuccess: string;
}

/**
 * Localizations for the `ticket` slash command.
 */
export class TicketLocalization extends Localization<TicketStrings> {
    protected override readonly localizations: Readonly<
        Translations<TicketStrings>
    > = {
        en: new TicketENTranslation(),
    };
}
