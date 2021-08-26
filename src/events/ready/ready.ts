import { Event } from '@alice-interfaces/core/Event';
import { EventHelper } from '@alice-utils/helpers/EventHelper';

export const run: Event["run"] = async (client) => {
    EventHelper.runUtilities(client, __dirname)
        .catch((e: Error) => client.emit("error", e));
};