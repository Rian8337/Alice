import { Guild, User } from "discord.js";
import { Event } from "@alice-interfaces/core/Event";
import { EventHelper } from "@alice-utils/helpers/EventHelper";

export const run: Event["run"] = async (client, guild: Guild, user: User) => {
    EventHelper.runUtilities(client, __dirname, guild, undefined, guild, user)
        .catch((e: Error) => client.emit("error", e));
};