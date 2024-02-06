import {
    CacheType,
    ModalSubmitInteraction,
    RepliableInteraction,
} from "discord.js";

/**
 * Interactions that can be replied with a modal.
 */
export type ModalRepliableInteraction<Cached extends CacheType = CacheType> =
    Exclude<RepliableInteraction<Cached>, ModalSubmitInteraction<Cached>>;
