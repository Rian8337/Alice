import { EventUtil } from "structures/core/EventUtil";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import { VoiceState } from "discord.js";

export const run: EventUtil["run"] = async (
    client,
    oldState: VoiceState,
    newState: VoiceState
) => {
    if (oldState.member!.id === client.user.id && !newState.channel) {
        MusicManager.leave(oldState.channel!);
    }
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for destroying voice connections if the bot was forcefully disconnected by a user to prevent memory leak.",
    togglePermissions: ["BotOwner"],
    toggleScope: ["GLOBAL"],
    debugEnabled: true,
};
