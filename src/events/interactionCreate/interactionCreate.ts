import { Event } from "@alice-interfaces/core/Event";
import { EventHelper } from "@alice-utils/helpers/EventHelper";
import {
    DMChannel,
    Interaction,
    NewsChannel,
    TextChannel,
    ThreadChannel,
} from "discord.js";

export const run: Event["run"] = async (client, interaction: Interaction) => {
    EventHelper.runUtilities(
        client,
        __dirname,
        interaction.guild,
        <DMChannel | TextChannel | NewsChannel | ThreadChannel>(
            interaction.channel
        ),
        interaction
    ).catch((e: Error) => client.emit("error", e));
};
