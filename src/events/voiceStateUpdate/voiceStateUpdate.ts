import { Event } from "structures/core/Event";
import { EventHelper } from "@utils/helpers/EventHelper";
import { VoiceState } from "discord.js";

export const run: Event["run"] = async (
    client,
    oldState: VoiceState,
    newState: VoiceState,
) => {
    EventHelper.runUtilities(
        client,
        __dirname,
        newState.guild,
        newState.channel ?? oldState.channel,
        oldState,
        newState,
    ).catch((e: Error) => client.emit("error", e));
};
