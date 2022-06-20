import {
    Interaction,
    InteractionResponseFields,
    Message,
    MessageComponentInteraction,
    WebhookEditMessageOptions,
} from "discord.js";

/**
 * A helper for responding to interactions.
 */
export abstract class InteractionHelper {
    /**
     * Defers a reply to an interaction.
     *
     * @param interaction The interaction to defer.
     * @param ephemeral Whether the reply should be ephemeral. Defaults to the interaction's `ephemeral` property.
     */
    static async deferReply(
        interaction: Interaction & InteractionResponseFields,
        ephemeral?: boolean
    ): Promise<void> {
        if (!interaction.deferred && !interaction.replied) {
            return interaction.deferReply({
                ephemeral: ephemeral ?? interaction.ephemeral ?? false,
            });
        }
    }

    /**
     * Defers an update to an interaction.
     *
     * @param interaction The interaction to defer.
     */
    static async deferUpdate(
        interaction: MessageComponentInteraction
    ): Promise<void> {
        if (!interaction.deferred && !interaction.replied) {
            return interaction.deferUpdate();
        }
    }

    /**
     * Replies to an interaction.
     *
     * @param interaction The interaction to reply to.
     * @param reply The reply to send.
     * @returns The response of the interaction.
     */
    static async reply(
        interaction: Interaction & InteractionResponseFields,
        reply: WebhookEditMessageOptions
    ): Promise<Message> {
        // Reset message components
        reply.components ??= [];

        let message: Message;

        if (interaction.deferred || interaction.replied) {
            message = <Message>await interaction.editReply(reply);
        } else {
            message = <Message>await interaction.reply({
                ...reply,
                fetchReply: true,
                ephemeral: interaction.ephemeral ?? false,
            });
        }

        return message;
    }

    /**
     * Sends an update response to an interaction.
     *
     * @param interaction The interaction to update.
     * @param response The response to send.
     * @returns The response of the interaction.
     */
    static async update(
        interaction: MessageComponentInteraction,
        response: WebhookEditMessageOptions
    ): Promise<Message> {
        // Reset message components
        response.components ??= [];

        return <Promise<Message>>interaction.update({
            ...response,
            fetchReply: true,
        });
    }
}
