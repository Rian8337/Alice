import { Translation } from "@alice-localization/base/Translation";
import { TicketEditStrings } from "../TicketEditLocalization";
import { bold } from "discord.js";

/**
 * The English translation for the `ticket-edit` modal command.
 */
export class TicketEditENTranslation extends Translation<TicketEditStrings> {
    override readonly translations: TicketEditStrings = {
        ticketNotFound: "I'm sorry, I could not find a ticket with that ID!",
        editTicketFailed: `I'm sorry, I was unable to edit the ticket. For copying convenience, here were your title and description:\n\n${bold("Title")}: %s\n\n${bold("Description")}: %s`,
        editTicketSuccess: "Successfully edited your ticket.",
    };
}
