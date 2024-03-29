import { Collection } from "discord.js";
import { AutocompleteHandler } from "./AutocompleteHandler";
import { AutocompleteSubhandler } from "./AutocompleteSubhandler";

/**
 * Represents an autocomplete handler that is cached.
 */
export interface CachedAutocompleteHandler extends AutocompleteHandler {
    /**
     * The handlers that handle subcommand groups that this command has, mapped by its name.
     */
    readonly subcommandGroups: Collection<string, AutocompleteSubhandler>;

    /**
     * The handlers that handle subcommands that this command has, mapped by its name.
     */
    readonly subcommands: Collection<string, AutocompleteSubhandler>;
}
