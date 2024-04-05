import { EventHelper } from "@alice-utils/helpers/EventHelper";
import { Guild } from "discord.js";
import { Event } from "structures/core/Event";

export const run: Event["run"] = async (
    client,
    oldGuild: Guild,
    newGuild: Guild,
) => {
    EventHelper.runUtilities(
        client,
        __dirname,
        newGuild,
        undefined,
        oldGuild,
        newGuild,
    ).catch((e: Error) => client.emit("error", e));
};
