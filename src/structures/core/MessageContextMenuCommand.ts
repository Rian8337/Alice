import { Bot } from "@alice-core/Bot";
import { MessageContextMenuCommandInteraction } from "discord.js";
import { ContextMenuCommand } from "./ContextMenuCommand";

/**
 * Represents a command that is executed through message context menus.
 */
export interface MessageContextMenuCommand extends ContextMenuCommand {
    /**
     * Executes the command.
     *
     * @param client The instance of the bot.
     * @param interaction The interaction that executes the command.
     */
    run(
        client: Bot,
        interaction: MessageContextMenuCommandInteraction
    ): Promise<unknown>;
}
