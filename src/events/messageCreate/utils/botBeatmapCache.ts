import { Message, EmbedBuilder } from "discord.js";
import { MapInfo } from "@rian8337/osu-base";
import { EventUtil } from "structures/core/EventUtil";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";

export const run: EventUtil["run"] = async (_, message: Message) => {
    if (!message.author.bot) {
        return;
    }

    const embed: EmbedBuilder | null = message.embeds[0]
        ? EmbedBuilder.from(message.embeds[0])
        : null;

    // Prioritize embed author
    const url: string | null =
        embed?.data.author?.url ?? embed?.data.url ?? null;

    if (!url) {
        return;
    }

    const beatmapID: number = BeatmapManager.getBeatmapID(url)[0];

    if (!beatmapID) {
        return;
    }

    const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
        beatmapID,
        { checkFile: false }
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
    togglePermissions: ["BotOwner"],
    toggleScope: ["GLOBAL"],
};
