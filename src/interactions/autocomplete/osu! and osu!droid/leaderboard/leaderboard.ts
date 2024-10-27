import { DatabaseManager } from "@database/DatabaseManager";
import { AutocompleteHandler } from "@structures/core/AutocompleteHandler";

export const run: AutocompleteHandler["run"] = async (_, interaction) => {
    // There is only one option - rework type, so we can just return the result directly
    interaction.respond(
        await DatabaseManager.aliceDb.collections.prototypePPType.searchReworkTypesForAutocomplete(
            interaction.options.getFocused(),
        ),
    );
};

export const config: AutocompleteHandler["config"] = {
    name: "leaderboard",
};
