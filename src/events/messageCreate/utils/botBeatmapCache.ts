import { Message, MessageEmbed } from "discord.js";
import { MapInfo } from "@rian8337/osu-base";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";

export const run: EventUtil["run"] = async (_, message: Message) => {
    if (!message.author.bot) {
        return;
    }

    const embed: MessageEmbed = message.embeds[0];

    // Prioritize embed author
    const url: string | undefined | null = embed?.author?.url ?? embed?.url;

    if (!url) {
        return;
    }

    const beatmapID: number = BeatmapManager.getBeatmapID(url)[0];

    if (!beatmapID) {
        return;
    }

    const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
        beatmapID,
        false
    );

    if (!beatmapInfo) {
        return;
    }

    BeatmapManager.setChannelLatestBeatmap(
        message.channel.id,
        beatmapInfo.hash
    );
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for caching latest beatmap in discussion from messages from bots.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
