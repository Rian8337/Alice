import { DatabaseManager } from "@alice-database/DatabaseManager";
import { AutocompleteHandler } from "@alice-structures/core/AutocompleteHandler";

export const run: AutocompleteHandler["run"] = async (_, interaction) => {
    const focusedValue: string = interaction.options.getFocused();

    interaction.respond(
        await DatabaseManager.aliceDb.collections.danCourses.searchBeatmapsForAutocomplete(
            focusedValue
        )
    );
};

export const config: AutocompleteHandler["config"] = {
    name: "dancourse",
};
