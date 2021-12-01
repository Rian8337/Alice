import { Event } from "@alice-interfaces/core/Event";
import { EventHelper } from "@alice-utils/helpers/EventHelper";
import { ThreadChannel } from "discord.js";

export const run: Event["run"] = async (
    client,
    oldThread: ThreadChannel,
    newThread: ThreadChannel
) => {
    EventHelper.runUtilities(
        client,
        __dirname,
        newThread.guild,
        newThread.parent,
        oldThread,
        newThread
    ).catch((e: Error) => client.emit("error", e));
};
