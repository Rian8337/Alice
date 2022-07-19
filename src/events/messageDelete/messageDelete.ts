import { Message } from "discord.js";
import { Event } from "structures/core/Event";
import { EventHelper } from "@alice-utils/helpers/EventHelper";

export const run: Event["run"] = async (client, message: Message) => {
    EventHelper.runUtilities(
        client,
        __dirname,
        message.guild,
        message.channel,
        message
    ).catch((e: Error) => client.emit("error", e));
};
