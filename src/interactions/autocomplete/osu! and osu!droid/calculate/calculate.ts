import { Modes } from "@rian8337/osu-base";
import { AutocompleteHandler } from "@structures/core/AutocompleteHandler";
import { PPVariantManager } from "@utils/managers/PPVariantManager";

export const run: AutocompleteHandler["run"] = async (_, interaction) => {
    const focused = interaction.options.getFocused(true);

    switch (focused.name) {
        case "variant":
            interaction.respond(
                await PPVariantManager.searchForAutocomplete(focused.value, {
                    actingUid: await PPVariantManager.getActingUid(
                        interaction.user,
                    ),
                    mode: Modes.Droid,
                }),
            );
            break;
        case "pcvariant":
            interaction.respond(
                await PPVariantManager.searchForAutocomplete(focused.value, {
                    actingUid: await PPVariantManager.getActingUid(
                        interaction.user,
                    ),
                    mode: Modes.Osu,
                }),
            );
            break;
    }
};

export const config: AutocompleteHandler["config"] = {
    name: "calculate",
};
