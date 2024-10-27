import { Translation } from "@localization/base/Translation";
import { TicketEditStrings } from "../TicketEditLocalization";
import { blockQuote } from "discord.js";

/**
 * The English translation for the `ticket-edit` modal command.
 */
export class TicketEditENTranslation extends Translation<TicketEditStrings> {
    override readonly translations: TicketEditStrings = {
        ticketNotFound: "I'm sorry, I could not find the ticket!",
        editTicketFailed: `I'm sorry, I was unable to edit the ticket. For copying convenience, here were your title and description:\n\nTitle:\n${blockQuote("%s")}\n\n"Description:\n${blockQuote("%s")}`,
        editTicketSuccess: "Successfully edited your ticket.",
    };
}
