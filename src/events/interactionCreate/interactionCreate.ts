import { Event } from "structures/core/Event";
import { EventHelper } from "@alice-utils/helpers/EventHelper";
import { BaseInteraction } from "discord.js";

export const run: Event["run"] = async (
    client,
    interaction: BaseInteraction
) => {
    EventHelper.runUtilities(
        client,
        __dirname,
        interaction.guild,
        interaction.channel,
        interaction
    ).catch((e: Error) => client.emit("error", e));
};
