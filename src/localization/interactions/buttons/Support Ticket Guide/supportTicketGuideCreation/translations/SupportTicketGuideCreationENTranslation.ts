import { Translation } from "@localization/base/Translation";
import { SupportTicketGuideCreationStrings } from "../SupportTicketGuideCreationLocalization";
import { chatInputApplicationCommandMention } from "discord.js";

/**
 * The English translation for the `supportTicketGuideCreation` button command.
 */
export class SupportTicketGuideCreationENTranslation extends Translation<SupportTicketGuideCreationStrings> {
    override readonly translations: SupportTicketGuideCreationStrings = {
        embedTitle: "Writing a Ticket",
        howToCreateTicket: `To create a ticket, use the "Create Ticket" button above. Alternatively, you can use the ${chatInputApplicationCommandMention("ticket", "create", "1204482021511135315")} command.`,
    };
}
