import { Event } from "structures/core/Event";
import { EventHelper } from "@alice-utils/helpers/EventHelper";

export const run: Event["run"] = async (client, error: Error) => {
    EventHelper.runUtilities(client, __dirname, undefined, undefined, error);
};
