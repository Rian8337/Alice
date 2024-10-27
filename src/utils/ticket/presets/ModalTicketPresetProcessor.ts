import {
    TextInputBuilder,
    ModalBuilder,
    ActionRowBuilder,
    RepliableInteraction,
    ModalSubmitInteraction,
} from "discord.js";
import { BaseTicketPresetProcessor } from "./BaseTicketPresetProcessor";
import { ProcessedSupportTicketPreset } from "@structures/utils/ProcessedSupportTicketPreset";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { ModalRepliableInteraction } from "@structures/core/ModalRepliableInteraction";
import { DatabaseSupportTicketPreset } from "@structures/database/aliceDb/DatabaseSupportTicketPreset";

/**
 * A ticket preset processor that supports sending and receiving modals.
 */
export abstract class ModalTicketPresetProcessor extends BaseTicketPresetProcessor {
    override async process(
        interaction: RepliableInteraction,
        preset: DatabaseSupportTicketPreset,
    ): Promise<unknown> {
        if (interaction instanceof ModalSubmitInteraction) {
            throw new Error(
                "This ticket preset cannot be used after a modal submission.",
            );
        }

        return this.processInitialInteraction(interaction, preset);
    }

    /**
     * Processes a ticket preset's modal submission.
     *
     * @param interaction The interaction.
     * @returns A structure denoting the processed state of the ticket preset, or `null`
     * to denote that the interaction entered invalid input(s).
     */
    abstract processModalSubmission(
        interaction: ModalSubmitInteraction,
    ): Promise<ProcessedSupportTicketPreset | null>;

    /**
     * Processes the initial interaction of a ticket preset.
     *
     * @param interaction The interaction.
     * @param preset The ticket preset.
     */
    protected abstract processInitialInteraction(
        interaction: ModalRepliableInteraction,
        preset: DatabaseSupportTicketPreset,
    ): Promise<unknown>;

    /**
     * Creates a modal with this ticket preset's title as its title and its
     * custom ID set to the ID of this ticket preset.
     *
     * @param fields The fields to add to the modal.
     */
    protected createModal(
        preset: DatabaseSupportTicketPreset,
        ...fields: TextInputBuilder[]
    ): ModalBuilder {
        return new ModalBuilder()
            .setCustomId(`ticket-create-with-preset#${preset.id}`)
            .setTitle(preset.title)
            .addComponents(
                fields.map((v) =>
                    new ActionRowBuilder<TextInputBuilder>().addComponents(v),
                ),
            );
    }

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
