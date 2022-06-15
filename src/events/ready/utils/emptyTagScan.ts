import { Config } from "@alice-core/Config";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";

export const run: EventUtil["run"] = async () => {
    setInterval(async () => {
        if (
            Config.maintenance ||
            CommandUtilManager.globallyDisabledEventUtils
                .get("ready")
                ?.includes("emptyTagScan")
        ) {
            return;
        }

        await DatabaseManager.aliceDb.collections.guildTags.deleteMany({
            $and: [
                {
                    date: {
                        // Tags that aren't 10 minutes old should be skipped. This prevents
                        // cases where a user's tag will be deleted immediately when this scan runs.
                        $lte: Date.now() - 60 * 10 * 1000,
                    },
                },
                {
                    content: "",
                },
                {
                    attachment_message: "",
                },
            ],
        });
    }, 60 * 20 * 1000);
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for periodically scanning for empty guild tags to prevent tag hoarding.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
