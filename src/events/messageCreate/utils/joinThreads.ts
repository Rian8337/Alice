import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { FetchedThreads, Message, NewsChannel, TextChannel } from "discord.js";

export const run: EventUtil["run"] = async (_, message: Message) => {
    if (
        !(message.channel instanceof TextChannel) &&
        !(message.channel instanceof NewsChannel)
    ) {
        return;
    }

    const activeThreads: FetchedThreads =
        await message.channel.threads.fetchActive();

    for await (const thread of activeThreads.threads.values()) {
        if (thread.joinable && !thread.joined) {
            await thread.join();
        }
    }
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for joining all joinable threads in a text channel.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
