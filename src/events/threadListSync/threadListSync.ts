import { Event } from "@alice-interfaces/core/Event";
import { EventHelper } from "@alice-utils/helpers/EventHelper";
import { Collection, Snowflake, ThreadChannel } from "discord.js";

export const run: Event["run"] = async (
    client,
    threads: Collection<Snowflake, ThreadChannel>
) => {
    EventHelper.runUtilities(
        client,
        __dirname,
        threads.first()?.guild,
        threads.first()?.parent,
        threads
    ).catch((e: Error) => client.emit("error", e));
};
