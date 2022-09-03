import { AutocompleteHandler } from "./AutocompleteHandler";

/**
 * Represents a slash command's autocomplete subhandler.
 */
export type AutocompleteSubhandler = Omit<AutocompleteHandler, "config">;
