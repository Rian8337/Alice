import { GuildBan } from "discord.js";
import { Event } from "@alice-interfaces/core/Event";
import { EventHelper } from "@alice-utils/helpers/EventHelper";

export const run: Event["run"] = async (client, guildBan: GuildBan) => {
    EventHelper.runUtilities(client, __dirname, guildBan.guild, undefined, guildBan)
        .catch((e: Error) => client.emit("error", e));
};