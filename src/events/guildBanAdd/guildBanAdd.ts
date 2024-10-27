import { GuildBan } from "discord.js";
import { Event } from "structures/core/Event";
import { EventHelper } from "@utils/helpers/EventHelper";

export const run: Event["run"] = async (client, guildBan: GuildBan) => {
    EventHelper.runUtilities(
        client,
        __dirname,
        guildBan.guild,
        undefined,
        guildBan,
    ).catch((e: Error) => client.emit("error", e));
};
