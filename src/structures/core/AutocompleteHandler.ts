import { Bot } from "@alice-core/Bot";
import { AutocompleteInteraction } from "discord.js";

/**
 * Represents a command's autocomplete handler.
 */
export interface AutocompleteHandler {
    /**
     * Executes this handler.
     *
     * @param client The instance of the bot.
     * @param interaction The interaction that executes the handler.
     */
    run(
        client: Bot,
        interaction: AutocompleteInteraction
    ): Promise<unknown>;

    /**
     * Configurations for the handler.
     */
    readonly config: {
        /**
         * The name of the command this handler is handling.
         */
        readonly name: string;
    };
}