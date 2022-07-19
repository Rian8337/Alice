import { RepliableInteraction } from "@alice-structures/core/RepliableInteraction";
import {
    InteractionResponse,
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
        interaction: RepliableInteraction,
        ephemeral?: boolean
    ): Promise<InteractionResponse | void> {
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
    ): Promise<InteractionResponse | void> {
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
        interaction: RepliableInteraction,
        reply: WebhookEditMessageOptions
    ): Promise<Message> {
        // Reset message components
        reply.components ??= [];

        let message: Message;

        if (interaction.deferred || interaction.replied) {
            message = await interaction.editReply(reply);
        } else {
            message = await interaction.reply({
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

        let message: Message;

        if (interaction.deferred || interaction.replied) {
            message = await interaction.editReply(response);
        } else {
            message = await interaction.update({
                ...response,
                fetchReply: true,
            });
        }

        return message;
    }
}
