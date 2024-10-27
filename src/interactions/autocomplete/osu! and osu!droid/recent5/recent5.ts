import { DatabaseManager } from "@database/DatabaseManager";
import { AutocompleteHandler } from "@structures/core/AutocompleteHandler";

export const run: AutocompleteHandler["run"] = async (_, interaction) => {
    const focusedValue: string = interaction.options.getFocused();

    interaction.respond(
        await DatabaseManager.elainaDb.collections.userBind.searchPlayersForAutocomplete(
            focusedValue,
        ),
    );
};

export const config: AutocompleteHandler["config"] = {
    name: "recent5",
};
