import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { ThreadChannel } from "discord.js";

export const run: EventUtil["run"] = async (
    _,
    __: ThreadChannel,
    newThread: ThreadChannel
) => {
    if (newThread.joinable && !newThread.joined) {
        await newThread.join();
    }
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for joining a thread upon any edit made (hacky way).",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
