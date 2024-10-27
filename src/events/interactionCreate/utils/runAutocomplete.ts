import { AutocompleteHandler } from "@structures/core/AutocompleteHandler";
import { BaseInteraction } from "discord.js";
import { EventUtil } from "structures/core/EventUtil";

export const run: EventUtil["run"] = async (
    client,
    interaction: BaseInteraction,
) => {
    if (!interaction.isAutocomplete()) {
        return;
    }

    const handler: AutocompleteHandler | undefined =
        client.interactions.autocomplete.get(interaction.commandName);

    if (!handler) {
        return interaction.respond([]);
    }

    handler
        .run(client, interaction)
        .catch((e: Error) => client.emit("error", e));
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for handling autocomplete received from interactions. This event utility cannot be disabled.",
    togglePermissions: [],
    toggleScope: [],
    debugEnabled: true,
};
