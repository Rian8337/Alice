import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { SupportTicketENTranslation } from "./translations/SupportTicketENTranslation";

export interface SupportTicketStrings {
    readonly ticketMovedNotice: string;
    readonly embedAuthor: string;
    readonly embedCreationDate: string;
    readonly embedStatus: string;
    readonly embedTicketAssignees: string;
    readonly embedTicketOpen: string;
    readonly embedTicketClosed: string;
    readonly embedTicketDescription: string;
    readonly ticketIsOpen: string;
    readonly ticketIsNotOpen: string;
    readonly userIsAlreadyAssigned: string;
    readonly userIsNotAssigned: string;
    readonly cannotGetTicketMessage: string;
    readonly cannotCreateThread: string;
    readonly userControlPanelEditButtonLabel: string;
    readonly userControlPanelCloseButtonLabel: string;
    readonly userControlPanelOpenButtonLabel: string;
    readonly userControlPanelMoveButtonLabel: string;
    readonly userControlPanelTrackingMessageButtonLabel: string;
    readonly trackingMessageAssignButtonLabel: string;
    readonly trackingMessageUnassignButtonLabel: string;
    readonly trackingMessageTicketChannelButtonLabel: string;
    readonly trackingMessageMoveButtonLabel: string;
    readonly none: string;
    readonly pleaseWait: string;
}

/**
 * Localizations for the `SupportTicket` database utility.
 */
export class SupportTicketLocalization extends Localization<SupportTicketStrings> {
    protected override readonly localizations: Readonly<
        Translations<SupportTicketStrings>
    > = {
        en: new SupportTicketENTranslation(),
    };
}
