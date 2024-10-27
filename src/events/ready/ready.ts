import { Event } from "structures/core/Event";
import { EventHelper } from "@utils/helpers/EventHelper";

export const run: Event["run"] = async (client) => {
    EventHelper.runUtilities(client, __dirname).catch((e: Error) =>
        client.emit("error", e),
    );
};
