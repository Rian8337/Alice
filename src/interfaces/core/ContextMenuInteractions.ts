import { Collection } from "discord.js";
import { MessageContextMenuCommand } from "./MessageContextMenuCommand";
import { UserContextMenuCommand } from "./UserContextMenuCommand";

/**
 * The context menu interactions that this bot has.
 */
export interface ContextMenuInteractions {
    /**
     * The message context menu commands that this bot has, mapped by the name of the command.
     */
    readonly message: Collection<string, MessageContextMenuCommand>;

    /**
     * The user context menu commands that this bot has, mapped by the name of the command.
     */
    readonly user: Collection<string, UserContextMenuCommand>;
}
