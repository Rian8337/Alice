import { Translation } from "@alice-localization/base/Translation";
import { TicketCreateStrings } from "../TicketCreateLocalization";
import { bold } from "discord.js";

/**
 * The English translation for the `ticket-edit` modal command.
 */
export class TicketCreateENTranslation extends Translation<TicketCreateStrings> {
    override readonly translations: TicketCreateStrings = {
        createTicketFailed: `I'm sorry, I could not make your ticket. For copying convenience, here were your title and description:\n\n${bold("Title")}: %s\n\n${bold("Description")}: %s`,
        createTicketSuccess: "Successfully created your ticket.",
    };
}
