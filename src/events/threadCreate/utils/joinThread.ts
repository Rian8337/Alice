import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { ThreadChannel } from "discord.js";

export const run: EventUtil["run"] = async (_, thread: ThreadChannel) => {
    if (thread.joinable) {
        await thread.join();
    }
};

export const config: EventUtil["config"] = {
    description: "Responsible for joining a thread upon its creation.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
