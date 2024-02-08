import { Translation } from "@alice-localization/base/Translation";
import { SupportTicketGuideButtonCreatorStrings } from "../SupportTicketGuideButtonCreatorLocalization";

/**
 * The English translation for the `SupportTicketGuideButtonCreator` utility.
 */
export class SupportTicketGuideButtonCreatorENTranslation extends Translation<SupportTicketGuideButtonCreatorStrings> {
    override readonly translations: SupportTicketGuideButtonCreatorStrings = {
        homeButton: "Home",
        purposeButton: "Purpose",
        writingTicketButton: "Writing a Ticket",
        ticketPresetsButton: "Ticket Presets",
        dosAndDontsButton: "DOs and DON'Ts",
    };
}
