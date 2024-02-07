import { Translation } from "@alice-localization/base/Translation";
import { SupportTicketGuidePresetsStrings } from "../SupportTicketGuidePresetsLocalization";
import { chatInputApplicationCommandMention, inlineCode } from "discord.js";

/**
 * The English translation for the `supportTicketGuidePresets` button command.
 */
export class SupportTicketGuidePresetsENTranslation extends Translation<SupportTicketGuidePresetsStrings> {
    override readonly translations: SupportTicketGuidePresetsStrings = {
        embedTitle: "Ticket Presets",
        aboutTicketPresets:
            "For commonly asked questions, ticket presets are provided. These are tickets that are prefilled, so that you do not have to write everything from scratch.",
        howToUse: `To create a ticket using a preset, press the "Create Ticket with Preset" button above or use the ${chatInputApplicationCommandMention("ticket", "create", "1204482021511135315")} command using the ${inlineCode("preset")} option.`,
    };
}
