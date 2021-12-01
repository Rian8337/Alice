import { Message } from "discord.js";

/**
 * A helper for Discord messages.
 */
export abstract class MessageHelper {
    /**
     * Checks if the specified message still exists in the channel.
     *
     * @param message The message.
     * @returns Whether the message still exists.
     */
    static async messageStillExists(message: Message): Promise<boolean> {
        try {
            await message.channel.messages.fetch(message.id);
            return true;
        } catch {
            return false;
        }
    }
}
