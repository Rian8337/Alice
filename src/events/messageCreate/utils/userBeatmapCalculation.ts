import { Config } from "@alice-core/Config";
import { Symbols } from "@alice-enums/utils/Symbols";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import { BeatmapDifficultyHelper } from "@alice-utils/helpers/BeatmapDifficultyHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { Message, MessageEmbed, MessageOptions } from "discord.js";
import {
    DroidPerformanceCalculator,
    MapInfo,
    MapStats,
    OsuPerformanceCalculator,
} from "osu-droid";
import { DroidBeatmapDifficultyHelper } from "@alice-utils/helpers/DroidBeatmapDifficultyHelper";
import { OsuBeatmapDifficultyHelper } from "@alice-utils/helpers/OsuBeatmapDifficultyHelper";

export const run: EventUtil["run"] = async (_, message: Message) => {
    if (Config.maintenance || message.author.bot) {
        return;
    }

    const calcParams: PerformanceCalculationParameters =
        BeatmapDifficultyHelper.getCalculationParamsFromMessage(
            message.content
        );

    for await (const arg of message.content.split(/\s+/g)) {
        if (
            (!arg.startsWith("https://osu.ppy.sh/") &&
                !arg.startsWith("https://dev.ppy.sh/")) ||
            !StringHelper.isValidURL(arg)
        ) {
            continue;
        }

        const beatmapID: number = BeatmapManager.getBeatmapID(arg)[0];
        const beatmapsetID: number = BeatmapManager.getBeatmapsetID(arg)[0];

        // Prioritize beatmap ID over beatmapset ID
        if (beatmapID) {
            const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
                beatmapID,
                false
            );

            if (!beatmapInfo) {
                continue;
            }

            // Beatmap cache
            BeatmapManager.setChannelLatestBeatmap(
                message.channel.id,
                beatmapInfo.hash
            );

            const droidCalcResult: PerformanceCalculationResult<DroidPerformanceCalculator> | null =
                await DroidBeatmapDifficultyHelper.calculateBeatmapPerformance(
                    beatmapID,
                    calcParams
                );

            const osuCalcResult: PerformanceCalculationResult<OsuPerformanceCalculator> | null =
                await OsuBeatmapDifficultyHelper.calculateBeatmapPerformance(
                    beatmapID,
                    calcParams
                );

            if (!droidCalcResult || !osuCalcResult) {
                continue;
            }

            const calcEmbedOptions: MessageOptions =
                await EmbedCreator.createCalculationEmbed(
                    calcParams,
                    droidCalcResult,
                    osuCalcResult,
                    message.member?.displayHexColor
                );

            let string: string = "";

            if (message.content.includes("-d")) {
                string += `Raw droid stars: ${droidCalcResult.result.stars.toString()}\nRaw droid pp: ${droidCalcResult.result.toString()}\n`;
            }

            if (message.content.includes("-p")) {
                string += `Raw PC stars: ${osuCalcResult.result.stars.toString()}\nRaw PC pp: ${osuCalcResult.result.toString()}`;
            }

            if (string) {
                calcEmbedOptions.content = string;
            }

            message.channel.send(calcEmbedOptions);
        } else if (beatmapsetID) {
            // Retrieve beatmap file one by one to not overcreate requests
            const beatmapInformations: MapInfo[] =
                await BeatmapManager.getBeatmaps(beatmapsetID, false);

            if (beatmapInformations.length === 0) {
                return;
            }

            beatmapInformations.sort((a, b) => {
                return b.totalDifficulty - a.totalDifficulty;
            });

            let string: string = "";

            if (beatmapInformations.length > 3) {
                string = MessageCreator.createAccept(
                    `I found ${beatmapInformations.length} maps, but only displaying up to 3 due to my limitations.`
                );
            }

            for await (const beatmapInfo of beatmapInformations) {
                await beatmapInfo.retrieveBeatmapFile();
            }

            const firstBeatmap: MapInfo = beatmapInformations[0];

            const embedOptions: MessageOptions =
                EmbedCreator.createBeatmapEmbed(firstBeatmap);

            if (string) {
                embedOptions.content = string;
            }

            // Empty files first, we will reenter all attachments later
            embedOptions.files = [];

            const embed: MessageEmbed = <MessageEmbed>embedOptions.embeds![0];

            const stats: MapStats =
                calcParams.customStatistics ?? new MapStats();

            embed
                .spliceFields(0, embed.fields.length)
                .setTitle(
                    `${firstBeatmap.artist} - ${firstBeatmap.title} by ${firstBeatmap.creator}`
                )
                .setColor(firstBeatmap.statusColor)
                .setAuthor({ name: "Beatmap Information" })
                .setURL(`https://osu.ppy.sh/s/${firstBeatmap.beatmapsetID}`)
                .setDescription(
                    `${firstBeatmap.showStatistics(1, stats)}\n` +
                        `**BPM**: ${firstBeatmap.convertBPM(
                            stats
                        )} - **Length**: ${firstBeatmap.convertTime(stats)}`
                );

            for await (const beatmapInfo of beatmapInformations) {
                if (embed.fields.length === 3) {
                    break;
                }

                const droidCalcResult: PerformanceCalculationResult<DroidPerformanceCalculator> | null =
                    await DroidBeatmapDifficultyHelper.calculateBeatmapPerformance(
                        beatmapID,
                        calcParams
                    );

                const osuCalcResult: PerformanceCalculationResult<OsuPerformanceCalculator> | null =
                    await OsuBeatmapDifficultyHelper.calculateBeatmapPerformance(
                        beatmapID,
                        calcParams
                    );

                if (!droidCalcResult || !osuCalcResult) {
                    continue;
                }

                embed.addField(
                    `__${
                        beatmapInfo.version
                    }__ (${droidCalcResult.result.stars.total.toFixed(2)} ${
                        Symbols.star
                    } | ${osuCalcResult.result.stars.total.toFixed(2)} ${
                        Symbols.star
                    })`,
                    `${beatmapInfo.showStatistics(2, stats)}\n` +
                        `**Max score**: ${beatmapInfo
                            .maxScore(stats)
                            .toLocaleString()} - **Max combo**: ${
                            beatmapInfo.maxCombo
                        }x\n` +
                        `**${droidCalcResult.result.total.toFixed(
                            2
                        )}**dpp - ${osuCalcResult.result.total.toFixed(2)}pp`
                );
            }

            message.channel.send(embedOptions);
        }
    }
};

export const config: EventUtil["config"] = {
    description: "Responsible for calculating beatmaps that are sent by users.",
    togglePermissions: ["MANAGE_CHANNELS"],
    toggleScope: ["GLOBAL", "GUILD", "CHANNEL"],
};
