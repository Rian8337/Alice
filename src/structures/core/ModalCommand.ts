import { Bot } from "@core/Bot";
import { ModalSubmitInteraction } from "discord.js";

/**
 * Represents a command that is executed through modal submissions.
 */
export interface ModalCommand {
    /**
     * Executes the command.
     *
     * @param client The instance of the bot.
     * @param interaction The interaction that executes the command.
     */
    run(client: Bot, interaction: ModalSubmitInteraction): Promise<unknown>;

    /**
     * Configurations for the command.
     */
    readonly config?: {
        /**
         * Whether to reply to this command execution in private (only the executor can see it).
         */
        readonly replyEphemeral?: boolean;

        /**
         * Whether to instantly defer the interaction when running in debug mode. Defaults to `true`.
         *
         * Use this when interaction replies aren't getting through due to short response time.
         */
        readonly instantDeferInDebug?: boolean;
    };
}
