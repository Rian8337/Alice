import { Bot } from "@alice-core/Bot";
import { UserContextMenuCommandInteraction } from "discord.js";
import { ContextMenuCommand } from "./ContextMenuCommand";

/**
 * Represents a command that is executed through user context menus.
 */
export interface UserContextMenuCommand extends ContextMenuCommand {
    /**
     * Executes the command.
     *
     * @param client The instance of the bot.
     * @param interaction The interaction that executes the command.
     */
    run(
        client: Bot,
        interaction: UserContextMenuCommandInteraction
    ): Promise<unknown>;
}
