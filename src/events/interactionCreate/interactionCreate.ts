import { Event } from "@alice-interfaces/core/Event";
import { EventHelper } from "@alice-utils/helpers/EventHelper";
import { Interaction } from "discord.js";

export const run: Event["run"] = async (client, interaction: Interaction) => {
    EventHelper.runUtilities(client, __dirname, interaction.guild, interaction.channel, interaction)
        .catch((e: Error) => client.emit("error", e));
};