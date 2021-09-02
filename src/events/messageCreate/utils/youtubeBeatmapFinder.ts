import { Message, MessageEmbed, MessageOptions } from "discord.js";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { RESTManager } from "@alice-utils/managers/RESTManager";
import { MapInfo, MapStats, RequestResponse } from "osu-droid";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { Symbols } from "@alice-enums/utils/Symbols";
import { PerformanceCalculationResult } from "@alice-interfaces/utils/PerformanceCalculationResult";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapDifficultyHelper } from "@alice-utils/helpers/BeatmapDifficultyHelper";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";

export const run: EventUtil["run"] = async (_, message: Message) => {
    if (message.author.bot) {
        return;
    }

    const ytRegex: RegExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]+).*/;

    const calcParams: PerformanceCalculationParameters = BeatmapDifficultyHelper.getCalculationParamsFromUser(message.content);

    for await (const arg of message.content.split(/\s+/g)) {
        const match: RegExpMatchArray | null = arg.match(ytRegex);

        if (!match) {
            continue;
        }

        const videoId: string = match[1];

        if (!videoId) {
            continue;
        }

        const data: RequestResponse = await RESTManager.request(`https://www.googleapis.com/youtube/v3/videos?key=${process.env.YOUTUBE_API_KEY}&part=snippet&id=${videoId}`)

        if (data.statusCode !== 200) {
            continue;
        }

        let info: any;
        try {
            info = JSON.parse(data.data.toString("utf-8"));
        } catch (ignored) {
            continue;
        }

        const items = info?.items[0]?.snippet;

        if (!items) {
            continue;
        }

        const description: string = items.description;

        // Limit to 3 beatmaps to prevent spam
        let validCount: number = 0;

        for await (const link of description.split("\n")) {
            if (validCount === 3) {
                break;
            }

            const beatmapID: number = BeatmapManager.getBeatmapID(link)[0];
            const beatmapsetID: number = BeatmapManager.getBeatmapsetID(link)[0];

            // Prioritize beatmap ID over beatmapset ID
            if (beatmapID) {
                const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(beatmapID, false);

                if (!beatmapInfo) {
                    continue;
                }

                // Beatmap cache
                BeatmapManager.setChannelLatestBeatmap(message.channel.id, beatmapInfo.hash);

                const calcResult: PerformanceCalculationResult | null = await BeatmapDifficultyHelper.calculateBeatmapPerformance(beatmapID, calcParams);

                if (!calcResult) {
                    continue;
                }

                const calcEmbedOptions: MessageOptions = await EmbedCreator.createCalculationEmbed(
                    calcParams,
                    calcResult,
                    message.member?.displayHexColor
                );

                message.channel.send(calcEmbedOptions);
            } else if (beatmapsetID) {
                // Retrieve beatmap file one by one to not overcreate requests
                const beatmapInformations: MapInfo[] = await BeatmapManager.getBeatmaps(beatmapsetID, false);

                if (beatmapInformations.length === 0) {
                    return;
                }

                beatmapInformations.sort((a, b) => {
                    return b.totalDifficulty - a.totalDifficulty;
                });

                let string: string = "";

                if (beatmapInformations.length > 3) {
                    string = MessageCreator.createAccept(`I found ${beatmapInformations.length} maps, but only displaying 3 due to my limitations.`);

                    beatmapInformations.splice(3);
                }

                for await (const beatmapInfo of beatmapInformations) {
                    await beatmapInfo.retrieveBeatmapFile();
                }

                const firstBeatmap: MapInfo = beatmapInformations[0];

                const embedOptions: MessageOptions = await EmbedCreator.createBeatmapEmbed(firstBeatmap);

                if (string) {
                    embedOptions.content = string;
                }

                // Empty files first, we will reenter all attachments later
                embedOptions.files = [];

                const embed: MessageEmbed = <MessageEmbed> embedOptions.embeds![0];

                const stats: MapStats = new MapStats({
                    mods: calcParams.mods,
                    speedMultiplier: calcParams.customStatistics?.speedMultiplier
                });

                embed.spliceFields(0, embed.fields.length)
                    .setTitle(`${firstBeatmap.artist} - ${firstBeatmap.title} by ${firstBeatmap.creator}`)
                    .setColor(firstBeatmap.statusColor)
                    .setAuthor("Beatmap Information")
                    .setURL(`https://osu.ppy.sh/s/${firstBeatmap.beatmapsetID}`)
                    .setDescription(
                        `${firstBeatmap.showStatistics(1, calcParams.mods)}\n` +
                        `**BPM**: ${firstBeatmap.convertBPM(stats)} - **Length**: ${firstBeatmap.convertTime(stats)}`
                    );

                for await (const beatmapInfo of beatmapInformations) {
                    const calcResult: PerformanceCalculationResult =
                        (await BeatmapDifficultyHelper.calculateBeatmapPerformance(beatmapInfo.hash, calcParams))!;

                    embed.addField(
                        `__${beatmapInfo.version}__ (${calcResult.droid.stars.total.toFixed(2)} ${Symbols.star} | ${calcResult.osu.stars.total.toFixed(2)} ${Symbols.star})`,
                        `${beatmapInfo.showStatistics(2, calcParams.mods)}\n` +
                        `**Max score**: ${beatmapInfo.maxScore(stats).toLocaleString()} - **Max combo**: ${beatmapInfo.maxCombo}x\n` +
                        `**${calcResult.droid.total.toFixed(2)}**dpp - ${calcResult.osu.total.toFixed(2)}pp`
                    );
                }

                message.channel.send(embedOptions);
            }

            ++validCount;
        }
    }
};

export const config: EventUtil["config"] =  {
    description: "Responsible for loading beatmaps that is linked from YouTube.",
    togglePermissions: ["MANAGE_CHANNELS"],
    toggleScope: ["GLOBAL", "GUILD", "CHANNEL"]
};