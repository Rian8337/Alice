import { GuildMember } from "discord.js";
import { Event } from "structures/core/Event";
import { EventHelper } from "@utils/helpers/EventHelper";

export const run: Event["run"] = async (client, member: GuildMember) => {
    EventHelper.runUtilities(
        client,
        __dirname,
        member.guild,
        undefined,
        member,
    ).catch((e: Error) => client.emit("error", e));
};
