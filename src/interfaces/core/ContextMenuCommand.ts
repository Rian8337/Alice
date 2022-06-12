import { Bot } from "@alice-core/Bot";
import { ContextMenuInteraction } from "discord.js";

/**
 * Represents a command that is executed through context menus.
 */
export interface ContextMenuCommand {
    /**
     * Executes the command.
     *
     * @param client The instance of the bot.
     * @param interaction The interaction that executes the command.
     */
    run(client: Bot, interaction: ContextMenuInteraction): Promise<unknown>;

    /**
     * Configurations for the command.
     */
    readonly config: {
        /**
         * The name of the command.
         */
        readonly name: string;

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
