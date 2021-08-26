import { Config } from "@alice-core/Config";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";

export const run: EventUtil["run"] = async (client) => {
    setInterval(async () => {
        if (Config.maintenance) {
            return;
        }

        const activity = ArrayHelper.getRandomArrayElement(Config.activityList);
        client.user!.setActivity(activity[0], { type: activity[1] });
    }, 10 * 1000);
};

export const config: EventUtil["config"] = {
    description: "Responsible for periodically changing bot activity status.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"]
};