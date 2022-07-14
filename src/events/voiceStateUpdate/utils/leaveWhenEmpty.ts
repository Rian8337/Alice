import { EventUtil } from "structures/core/EventUtil";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import { VoiceState } from "discord.js";

export const run: EventUtil["run"] = async (
    _,
    oldState: VoiceState,
    newState: VoiceState
) => {
    if (!newState.channel && oldState.channel!.members.size === 1) {
        MusicManager.leave(oldState.channel!);
    }
};

export const config: EventUtil["config"] = {
    description: "Responsible for leaving voice channels when they are empty.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
    debugEnabled: true,
};
