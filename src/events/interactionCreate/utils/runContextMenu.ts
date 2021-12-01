import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { Interaction } from "discord.js";

export const run: EventUtil["run"] = async (
    client,
    interaction: Interaction
) => {
    if (!interaction.isContextMenu()) {
        return;
    }

    // TODO: test this for fun perhaps
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for handling commands from context menus. This event utility cannot be disabled.",
    togglePermissions: [],
    toggleScope: [],
    debugEnabled: true,
};
