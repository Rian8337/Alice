import { GuildMember } from "discord.js";
import { Event } from "@alice-interfaces/core/Event";
import { EventHelper } from "@alice-utils/helpers/EventHelper";

export const run: Event["run"] = async (client, member: GuildMember) => {
    EventHelper.runUtilities(
        client,
        __dirname,
        member.guild,
        undefined,
        member
    ).catch((e: Error) => client.emit("error", e));
};
