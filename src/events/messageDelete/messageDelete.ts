import {
    DMChannel,
    Message,
    NewsChannel,
    TextChannel,
    ThreadChannel,
} from "discord.js";
import { Event } from "structures/core/Event";
import { EventHelper } from "@alice-utils/helpers/EventHelper";

export const run: Event["run"] = async (client, message: Message) => {
    EventHelper.runUtilities(
        client,
        __dirname,
        message.guild,
        <DMChannel | TextChannel | NewsChannel | ThreadChannel>message.channel,
        message
    ).catch((e: Error) => client.emit("error", e));
};
