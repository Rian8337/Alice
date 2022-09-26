import {
    ActionRowBuilder,
    ModalBuilder,
    ModalSubmitInteraction,
    RepliableInteraction,
    TextInputBuilder,
} from "discord.js";

/**
 * A utility to create modals for interactions.
 */
export abstract class ModalCreator {
    /**
     * Creates a modal and shows it as a response to an interaction.
     *
     * @param interaction The interaction.
     * @param customId The ID of the modal.
     * @param title The title of the modal.
     * @param fields The fields in the modal.
     */
    static async createModal(
        interaction: Exclude<RepliableInteraction, ModalSubmitInteraction>,
        customId: string,
        title: string,
        ...fields: TextInputBuilder[]
    ): Promise<void> {
        const modal: ModalBuilder = new ModalBuilder()
            .setCustomId(customId)
            .setTitle(title)
            .addComponents(
                ...fields.map((v) =>
                    new ActionRowBuilder<TextInputBuilder>().addComponents(v)
                )
            );

        await interaction.showModal(modal);
    }
}
