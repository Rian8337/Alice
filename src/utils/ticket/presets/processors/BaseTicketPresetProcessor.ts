import { Language } from "@alice-localization/base/Language";
import { ProcessedSupportTicketPreset } from "@alice-structures/utils/ProcessedSupportTicketPreset";
import { Manager } from "@alice-utils/base/Manager";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { ModalSubmitInteraction } from "discord.js";

/**
 * The base of ticket preset processors.
 */
export abstract class BaseTicketPresetProcessor extends Manager {
    /**
     * Processes a ticket preset's modal interaction.
     *
     * @param interaction The interaction.
     * @param language The language to process for. Defaults to English.
     * @returns A structure containing the title and description of the ticket, or `null`
     * to invalidate the preset entry.
     */
    abstract processModalFields(
        interaction: ModalSubmitInteraction,
        language?: Language,
    ): Promise<ProcessedSupportTicketPreset | null>;

    /**
     * Invalidates a ticket preset's modal interaction.
     *
     * @param interaction The interaction.
     * @param rejectionResponse The response to be displayed to the user.
     * @returns Always `null`.
     */
    protected async invalidateModal(
        interaction: ModalSubmitInteraction,
        rejectionResponse: string,
    ): Promise<null> {
        await InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(rejectionResponse),
        });

        return null;
    }
}
