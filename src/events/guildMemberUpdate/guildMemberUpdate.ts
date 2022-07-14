import { GuildMember } from "discord.js";
import { Event } from "structures/core/Event";
import { EventHelper } from "@alice-utils/helpers/EventHelper";

export const run: Event["run"] = async (
    client,
    oldMember: GuildMember,
    newMember: GuildMember
) => {
    EventHelper.runUtilities(
        client,
        __dirname,
        newMember.guild,
        undefined,
        oldMember,
        newMember
    ).catch((e: Error) => client.emit("error", e));
};
