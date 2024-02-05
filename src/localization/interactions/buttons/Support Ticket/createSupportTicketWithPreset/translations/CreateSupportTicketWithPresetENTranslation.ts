import { Translation } from "@alice-localization/base/Translation";
import { CreateSupportTicketWithPresetStrings } from "../CreateSupportTicketWithPresetLocalization";

/**
 * The English translation for the `createSupportTicketWithPreset` button command.
 */
export class CreateSupportTicketWithPresetENTranslation extends Translation<CreateSupportTicketWithPresetStrings> {
    override readonly translations: CreateSupportTicketWithPresetStrings = {
        noTicketPresetsExist:
            "I'm sorry, there are no ticket presets as of now!",
        selectPresetPrompt: "Please select a preset.",
        presetNotFound: "I'm sorry, I could not find the preset!",
        modalTitle: "Create Ticket",
        modalTitleLabel: "Title",
        modalTitlePlaceholder: "Enter the title of the ticket.",
        modalDescriptionLabel: "Description",
        modalDescriptionPlaceholder: "Enter the description of the ticket.",
    };
}
