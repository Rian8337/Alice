import {
    DMChannel,
    Message,
    NewsChannel,
    TextChannel,
    ThreadChannel,
} from "discord.js";
import { Event } from "@alice-interfaces/core/Event";
import { EventHelper } from "@alice-utils/helpers/EventHelper";

export const run: Event["run"] = async (
    client,
    oldMessage: Message,
    newMessage: Message
) => {
    EventHelper.runUtilities(
        client,
        __dirname,
        newMessage.guild,
        <DMChannel | TextChannel | NewsChannel | ThreadChannel>(
            newMessage.channel
        ),
        oldMessage,
        newMessage
    ).catch((e: Error) => client.emit("error", e));
};
