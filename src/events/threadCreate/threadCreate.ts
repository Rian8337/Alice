import { Event } from "@alice-interfaces/core/Event";
import { EventHelper } from "@alice-utils/helpers/EventHelper";
import { ThreadChannel } from "discord.js";

export const run: Event["run"] = async (client, thread: ThreadChannel) => {
    EventHelper.runUtilities(
        client,
        __dirname,
        thread.guild,
        thread.parent,
        thread
    ).catch((e: Error) => client.emit("error", e));
};
