import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { SupportTicketENTranslation } from "./translations/SupportTicketENTranslation";

export interface SupportTicketStrings {
    readonly ticketMovedNotice: string;
    readonly embedAuthor: string;
    readonly embedStatus: string;
    readonly embedTicketFromPreset: string;
    readonly embedTicketAssignees: string;
    readonly embedTicketOpen: string;
    readonly embedTicketClosed: string;
    readonly embedTicketDescription: string;
    readonly embedCloseDate: string;
    readonly ticketIsTooOldToOpen: string;
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
