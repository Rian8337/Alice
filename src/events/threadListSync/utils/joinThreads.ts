import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { Collection, Snowflake, ThreadChannel } from "discord.js";

export const run: EventUtil["run"] = async (
    _,
    threads: Collection<Snowflake, ThreadChannel>
) => {
    for (const thread of threads.values()) {
        if (thread.joinable && !thread.joined) {
            await thread.join();
        }
    }
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for joining the bot to threads the bot has access to.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
