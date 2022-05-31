import {
    BaseCommandInteraction,
    MessageActionRow,
    Modal,
    ModalActionRowComponent,
    TextInputComponent,
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
        interaction: BaseCommandInteraction,
        customId: string,
        title: string,
        ...fields: TextInputComponent[]
    ): Promise<void> {
        const modal: Modal = new Modal()
            .setCustomId(customId)
            .setTitle(title)
            .addComponents(
                ...fields.map((v) =>
                    new MessageActionRow<ModalActionRowComponent>().addComponents(
                        v
                    )
                )
            );

        await interaction.showModal(modal);
    }
}
