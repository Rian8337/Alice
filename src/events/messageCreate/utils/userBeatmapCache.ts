import { Config } from "@alice-core/Config";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { Message } from "discord.js";
import { MapInfo } from "osu-droid";

export const run: EventUtil["run"] = async (_, message: Message) => {
    if (Config.maintenance || message.author.bot) {
        return;
    }

    for await (const arg of message.content.split(/\s+/g)) {
        if (
            (!arg.startsWith("https://osu.ppy.sh/") &&
                !arg.startsWith("https://dev.ppy.sh/")) ||
            !StringHelper.isValidURL(arg)
        ) {
            continue;
        }

        const beatmapID: number = BeatmapManager.getBeatmapID(arg)[0];

        if (beatmapID) {
            const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
                beatmapID,
                false
            );

            if (!beatmapInfo) {
                continue;
            }

            BeatmapManager.setChannelLatestBeatmap(
                message.channel.id,
                beatmapInfo.hash
            );
        }
    }
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for caching latest beatmap in discussion from messages from users.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
