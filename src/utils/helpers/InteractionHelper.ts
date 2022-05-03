import {
    Interaction,
    InteractionResponseFields,
    Message,
    WebhookEditMessageOptions,
} from "discord.js";

/**
 * A helper for responding to interactions.
 */
export abstract class InteractionHelper {
    /**
     * Replies to an interaction.
     *
     * @param interaction The interaction to reply to.
     * @param reply The reply to send.
     * @returns The response of the command.
     */
    static async reply(
        interaction: Interaction & InteractionResponseFields,
        reply: WebhookEditMessageOptions
    ): Promise<Message> {
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
}
