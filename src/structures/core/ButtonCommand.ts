import { Bot } from "@alice-core/Bot";
import { ButtonInteraction } from "discord.js";

/**
 * Represents a command that is executed through buttons.
 */
export interface ButtonCommand {
    /**
     * Executes the command.
     *
     * @param client The instance of the bot.
     * @param interaction The interaction that executes the command.
     */
    run(client: Bot, interaction: ButtonInteraction): Promise<unknown>;

    /**
     * Configurations for the command.
     */
    readonly config?: {
        /**
         * The cooldown of the command, in seconds.
         */
        readonly cooldown?: number;

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
