import { Bot } from "@core/Bot";
import {
    ApplicationIntegrationType,
    ContextMenuCommandInteraction,
    InteractionContextType,
} from "discord.js";

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
    run(
        client: Bot,
        interaction: ContextMenuCommandInteraction,
    ): Promise<unknown>;

    /**
     * Configurations for the command.
     */
    readonly config: {
        /**
         * The name of the command.
         */
        readonly name: string;

        /**
         * Interaction contexts where this command can be used, only for globally-scoped commands. Defaults to all interaction context types.
         */
        readonly contexts?: InteractionContextType[];

        /**
         * Installation contexts where the command is available, only for globally-scoped commands. Defaults to all integration types.
         */
        readonly integrationTypes?: ApplicationIntegrationType[];

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
