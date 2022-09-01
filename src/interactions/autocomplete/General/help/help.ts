import { AutocompleteHandler } from "@alice-structures/core/AutocompleteHandler";

export const run: AutocompleteHandler["run"] = async (client, interaction) => {
    const focusedValue: string = interaction.options.getFocused();

    interaction.respond(
        [...client.interactions.chatInput.keys()]
            .filter((v) => v.startsWith(focusedValue))
            .slice(0, 25)
            .map((v) => {
                return {
                    name: v,
                    value: v,
                };
            })
    );
};

export const config: AutocompleteHandler["config"] = {
    name: "help",
};
