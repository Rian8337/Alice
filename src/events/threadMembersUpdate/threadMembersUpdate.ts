import { Event } from "structures/core/Event";
import { EventHelper } from "@alice-utils/helpers/EventHelper";
import { Collection, Snowflake, ThreadMember } from "discord.js";

export const run: Event["run"] = async (
    client,
    oldMembers: Collection<Snowflake, ThreadMember>,
    newMembers: Collection<Snowflake, ThreadMember>
) => {
    EventHelper.runUtilities(
        client,
        __dirname,
        (newMembers.first() ?? oldMembers.first())?.thread.guild,
        (newMembers.first() ?? oldMembers.first())?.thread.parent,
        oldMembers,
        newMembers
    ).catch((e: Error) => client.emit("error", e));
};
