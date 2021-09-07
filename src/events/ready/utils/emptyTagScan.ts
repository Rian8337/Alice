import { Config } from "@alice-core/Config";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { GuildTagsCollectionManager } from "@alice-database/managers/aliceDb/GuildTagsCollectionManager";
import { GuildTags } from "@alice-database/utils/aliceDb/GuildTags";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";

export const run: EventUtil["run"] = async () => {
    const dbManager: GuildTagsCollectionManager = DatabaseManager.aliceDb.collections.guildTags;

    setInterval(async () => {
        if (Config.maintenance || CommandUtilManager.globallyDisabledEventUtils.get("ready")?.includes("emptyTagScan")) {
            return;
        }

        let unscannedTags: GuildTags | null;

        while (unscannedTags = await dbManager.getUnscannedGuildTags()) {
            for (const tag of unscannedTags.tags.values()) {
                // Tags that aren't 10 minutes old should be skipped. This prevents
                // cases where a user's tag will be deleted immediately when this scan runs.
                if (DateTimeFormatHelper.getTimeDifference(tag.date) > -60 * 10 * 1000) {
                    continue;
                }

                if (!tag.content && tag.attachments.length === 0) {
                    unscannedTags.tags.delete(tag.name);
                }
            }

            await dbManager.updateGuildTags(unscannedTags.guildid, unscannedTags.tags);
        }
    }, 60 * 20 * 1000);
};

export const config: EventUtil["config"] = {
    description: "Responsible for periodically scanning for empty guild tags to prevent tag hoarding.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"]
};