import { Collection } from "discord.js";
import { CachedSlashCommand } from "./CachedSlashCommand";
import { ContextMenuInteractions } from "./ContextMenuInteractions";
import { ModalCommand } from "./ModalCommand";

/**
 * The interactions that this bot has.
 */
export interface BotInteractions {
    /**
     * The chat input (slash) commands that this bot has, mapped by the name of the command.
     */
    readonly chatInput: Collection<string, CachedSlashCommand>;

    /**
     * The context menu commands that this bot has.
     */
    readonly contextMenu: ContextMenuInteractions;

    /**
     * The modal submit commands that this bot has, mapped by the name of the command.
     */
    readonly modalSubmit: Collection<string, ModalCommand>;
}
