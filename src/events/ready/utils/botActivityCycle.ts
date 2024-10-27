import { Config } from "@core/Config";
import { EventUtil } from "structures/core/EventUtil";
import { ArrayHelper } from "@utils/helpers/ArrayHelper";
import { CommandUtilManager } from "@utils/managers/CommandUtilManager";
import { ActivityType } from "discord.js";

export const run: EventUtil["run"] = async (client) => {
    if (Config.isDebug) {
        client.user.setActivity("Debug mode", { type: ActivityType.Playing });
        return;
    }

    setInterval(async () => {
        if (
            Config.maintenance ||
            CommandUtilManager.globallyDisabledEventUtils
                .get("ready")
                ?.includes("botActivityCycle")
        ) {
            return;
        }

        const activity = ArrayHelper.getRandomArrayElement(Config.activityList);
        client.user.setActivity(activity[0], { type: activity[1] });
    }, 10 * 1000);
};

export const config: EventUtil["config"] = {
    description: "Responsible for periodically changing bot activity status.",
    togglePermissions: ["BotOwner"],
    toggleScope: ["GLOBAL"],
    debugEnabled: true,
};
