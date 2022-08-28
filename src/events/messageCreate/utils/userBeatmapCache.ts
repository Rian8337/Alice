import { Config } from "@alice-core/Config";
import { EventUtil } from "structures/core/EventUtil";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { Message } from "discord.js";
import { MapInfo } from "@rian8337/osu-base";

export const run: EventUtil["run"] = async (_, message: Message) => {
    if (Config.maintenance || message.author.bot) {
        return;
    }

    for (const arg of message.content.split(/\s+/g)) {
        if (
            (!arg.startsWith("https://osu.ppy.sh/") &&
                !arg.startsWith("https://dev.ppy.sh/")) ||
            !StringHelper.isValidURL(arg)
        ) {
            continue;
        }

        const beatmapID: number = BeatmapManager.getBeatmapID(arg)[0];

        if (beatmapID) {
            const beatmapInfo: MapInfo<false> | null =
                await BeatmapManager.getBeatmap(beatmapID, {
                    checkFile: false,
                });

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
    togglePermissions: ["BotOwner"],
    toggleScope: ["GLOBAL"],
};
