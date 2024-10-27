import { DatabaseManager } from "@database/DatabaseManager";
import { AutocompleteHandler } from "@structures/core/AutocompleteHandler";

export const run: AutocompleteHandler["run"] = async (_, interaction) => {
    interaction.respond(
        await DatabaseManager.aliceDb.collections.supportTicketPreset.searchPresets(
            interaction.options.getFocused(),
        ),
    );
};

export const config: AutocompleteHandler["config"] = {
    name: "ticket",
};
