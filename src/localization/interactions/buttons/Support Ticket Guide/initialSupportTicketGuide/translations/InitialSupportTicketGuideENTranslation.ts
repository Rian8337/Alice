import { Translation } from "@localization/base/Translation";
import { InitialSupportTicketGuideStrings } from "../InitialSupportTicketGuideLocalization";

/**
 * The English translation for the `initialSupportTicketGuide` button command.
 */
export class InitialSupportTicketGuideENTranslation extends Translation<InitialSupportTicketGuideStrings> {
    override readonly translations: InitialSupportTicketGuideStrings = {
        embedTitle: "Support Ticket Guide",
        welcomeToGuide: "Welcome to the support ticket guide!",
        beginGuide: "Begin the guide by pressing one of the buttons below.",
        homeButton: "Home",
    };
}
