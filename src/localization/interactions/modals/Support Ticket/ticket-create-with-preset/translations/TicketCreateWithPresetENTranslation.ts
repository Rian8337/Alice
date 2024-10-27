import { Translation } from "@localization/base/Translation";
import { TicketCreateWithPresetStrings } from "../TicketCreateWithPresetLocalization";
import { bold } from "discord.js";

/**
 * The English translation for the `ticket-create-with-preset` modal command.
 */
export class TicketCreateWithPresetENTranslation extends Translation<TicketCreateWithPresetStrings> {
    override readonly translations: TicketCreateWithPresetStrings = {
        presetNotFound: "I'm sorry, I could not find the preset!",
        createTicketFailed: `I'm sorry, I could not make your ticket. For copying convenience, here were your title and description:\n\n${bold("Title")}: %s\n\n${bold("Description")}: %s`,
        createTicketSuccess: "Successfully created your ticket.",
    };
}
