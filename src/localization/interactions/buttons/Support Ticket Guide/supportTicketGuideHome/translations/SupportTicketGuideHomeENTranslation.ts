import { Translation } from "@localization/base/Translation";
import { SupportTicketGuideHomeStrings } from "../SupportTicketGuideHomeLocalization";

/**
 * The English translation for the `supportTicketGuideHome` button command.
 */
export class SupportTicketGuideHomeENTranslation extends Translation<SupportTicketGuideHomeStrings> {
    override readonly translations: SupportTicketGuideHomeStrings = {
        embedTitle: "Support Ticket Guide",
        aboutGuide: "This is a guide on using support tickets.",
        beginGuide: "Begin the guide by pressing one of the buttons below.",
        homeButton: "Home",
    };
}
