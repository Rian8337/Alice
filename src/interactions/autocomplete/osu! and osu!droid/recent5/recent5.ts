import { AutocompleteHandler } from "@structures/core/AutocompleteHandler";
import { DroidHelper } from "@utils/helpers/DroidHelper";

export const run: AutocompleteHandler["run"] = async (_, interaction) => {
    interaction.respond(
        await DroidHelper.searchPlayersForAutocomplete(
            interaction.options.getFocused(),
        ),
    );
};

export const config: AutocompleteHandler["config"] = {
    name: "recent5",
};
