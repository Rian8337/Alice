import { Message } from "discord.js";
import { EventUtil } from "@alice-interfaces/core/EventUtil";

// TODO: rest manager
export const run: EventUtil["run"] = async (client, message: Message) => {
    if (message.author.bot) {
        return;
    }
};

export const config: EventUtil["config"] =  {
    description: "Responsible for loading beatmaps that is linked from YouTube.",
    togglePermissions: ["MANAGE_CHANNELS"],
    toggleScope: ["GLOBAL", "GUILD", "CHANNEL"]
};