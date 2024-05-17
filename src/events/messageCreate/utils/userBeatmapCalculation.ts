import { Config } from "@alice-core/Config";
import { Symbols } from "@alice-enums/utils/Symbols";
import { EventUtil } from "structures/core/EventUtil";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapDifficultyHelper } from "@alice-utils/helpers/BeatmapDifficultyHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { Message, EmbedBuilder, bold, underscore } from "discord.js";
import {
    MapInfo,
    Modes,
    calculateOsuDifficultyStatistics,
} from "@rian8337/osu-base";
import { UserBeatmapCalculationLocalization } from "@alice-localization/events/messageCreate/userBeatmapCalculation/UserBeatmapCalculationLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DPPProcessorRESTManager } from "@alice-utils/managers/DPPProcessorRESTManager";
import { PPCalculationMethod } from "@alice-enums/utils/PPCalculationMethod";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";

export const run: EventUtil["run"] = async (_, message: Message) => {
    if (Config.maintenance || message.author.bot) {
        return;
    }

    const localization = new UserBeatmapCalculationLocalization(
        message.channel.isDMBased()
            ? CommandHelper.getLocale(message.author)
            : CommandHelper.getLocale(message.channelId, message.guildId!),
    );

    const calcParams = BeatmapDifficultyHelper.getCalculationParamsFromMessage(
        message.content,
    );

    for (const arg of message.content.split(/\s+/g)) {
        if (
            (!arg.startsWith("https://osu.ppy.sh/") &&
                !arg.startsWith("https://dev.ppy.sh/")) ||
            !StringHelper.isValidURL(arg)
        ) {
            continue;
        }

        const beatmapId = BeatmapManager.getBeatmapID(arg)[0];
        const beatmapsetId = BeatmapManager.getBeatmapsetID(arg)[0];

        // Prioritize beatmap ID over beatmapset ID
        if (beatmapId) {
            const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
                beatmapId,
                { checkFile: false },
            );

            if (!beatmapInfo) {
                continue;
            }

            calcParams.recalculateAccuracy(beatmapInfo.objects);

            // Beatmap cache
            BeatmapManager.setChannelLatestBeatmap(
                message.channel.id,
                beatmapInfo.hash,
            );

            const droidAttribs =
                await DPPProcessorRESTManager.getPerformanceAttributes(
                    beatmapId,
                    Modes.droid,
                    PPCalculationMethod.live,
                    calcParams,
                );

            if (!droidAttribs) {
                continue;
            }

            const osuAttribs =
                await DPPProcessorRESTManager.getPerformanceAttributes(
                    beatmapId,
                    Modes.osu,
                    PPCalculationMethod.live,
                    calcParams,
                );

            if (!osuAttribs) {
                continue;
            }

            const calcEmbedOptions = EmbedCreator.createCalculationEmbed(
                beatmapInfo,
                calcParams,
                droidAttribs.difficulty,
                osuAttribs.difficulty,
                droidAttribs.performance,
                osuAttribs.performance,
                localization.language,
            );

            let string = "";

            if (message.content.includes("-d")) {
                string += `${localization.getTranslation(
                    "droidStars",
                )}: ${DPPHelper.getDroidDifficultyAttributesInfo(
                    droidAttribs.difficulty,
                )}\n${localization.getTranslation(
                    "droidPP",
                )}: ${DPPHelper.getDroidPerformanceAttributesInfo(
                    droidAttribs.performance,
                )}\n`;
            }

            if (message.content.includes("-p")) {
                string += `${localization.getTranslation(
                    "pcStars",
                )}: ${DPPHelper.getOsuDifficultyAttributesInfo(
                    osuAttribs.difficulty,
                )}\n${localization.getTranslation(
                    "pcPP",
                )}: ${DPPHelper.getOsuPerformanceAttributesInfo(
                    osuAttribs.performance,
                )}`;
            }

            if (string) {
                calcEmbedOptions.content = string;
            }

            message.channel.send(calcEmbedOptions);
        } else if (beatmapsetId) {
            // Retrieve beatmap file one by one to not overcreate requests
            const beatmapInformations = await BeatmapManager.getBeatmaps(
                beatmapsetId,
                false,
            );

            if (beatmapInformations.length === 0) {
                return;
            }

            beatmapInformations.sort(
                (a, b) => (b.totalDifficulty ?? 0) - (a.totalDifficulty ?? 0),
            );

            let string = "";

            if (beatmapInformations.length > 3) {
                string = MessageCreator.createAccept(
                    localization.getTranslation("beatmapLimitation"),
                    beatmapInformations.length.toString(),
                );
            }

            const firstBeatmap = beatmapInformations[0];

            const embedOptions = EmbedCreator.createBeatmapEmbed(
                firstBeatmap,
                undefined,
                localization.language,
            );

            if (string) {
                embedOptions.content = string;
            }

            // Empty files first, we will reenter all attachments later
            embedOptions.files = [];

            const embed = EmbedBuilder.from(embedOptions.embeds![0]);

            const difficultyStatisticsCalculatorOptions =
                calcParams.toDifficultyStatisticsCalculatorOptions();

            const speedMultiplier = calculateOsuDifficultyStatistics(
                difficultyStatisticsCalculatorOptions,
            ).overallSpeedMultiplier;

            embed
                .spliceFields(0, embed.data.fields!.length)
                .setTitle(
                    `${firstBeatmap.artist} - ${firstBeatmap.title} by ${firstBeatmap.creator}`,
                )
                .setColor(BeatmapManager.getStatusColor(firstBeatmap.approved))
                .setAuthor({ name: "Beatmap Information" })
                .setURL(firstBeatmap.beatmapSetLink)
                .setDescription(
                    `${BeatmapManager.showStatistics(
                        firstBeatmap,
                        1,
                        difficultyStatisticsCalculatorOptions,
                    )}\n` +
                        `${bold("BPM")}: ${BeatmapManager.convertBPM(
                            firstBeatmap.bpm,
                            speedMultiplier,
                        )} - ${bold("Length")}: ${BeatmapManager.convertTime(
                            firstBeatmap.hitLength,
                            firstBeatmap.totalLength,
                            speedMultiplier,
                        )}`,
                );

            for (const beatmapInfo of beatmapInformations) {
                if (embed.data.fields!.length === 3) {
                    break;
                }

                const droidDiffAttribs =
                    await DPPProcessorRESTManager.getDifficultyAttributes(
                        beatmapInfo.hash,
                        Modes.droid,
                        PPCalculationMethod.live,
                        calcParams,
                    );

                const osuDiffAttribs =
                    await DPPProcessorRESTManager.getDifficultyAttributes(
                        beatmapInfo.hash,
                        Modes.osu,
                        PPCalculationMethod.live,
                        calcParams,
                    );

                if (!droidDiffAttribs || !osuDiffAttribs) {
                    continue;
                }

                embed.addFields({
                    name: `${underscore(
                        beatmapInfo.version,
                    )} (${droidDiffAttribs.starRating.toFixed(2)} ${
                        Symbols.star
                    } | ${osuDiffAttribs.starRating.toFixed(2)} ${
                        Symbols.star
                    })`,
                    value:
                        `${BeatmapManager.showStatistics(
                            beatmapInfo,
                            2,
                            difficultyStatisticsCalculatorOptions,
                        )}\n` +
                        `${BeatmapManager.showStatistics(
                            beatmapInfo,
                            3,
                            difficultyStatisticsCalculatorOptions,
                        )}\n` +
                        `${BeatmapManager.showStatistics(
                            beatmapInfo,
                            4,
                            difficultyStatisticsCalculatorOptions,
                        )}\n` +
                        `${bold(
                            droidDiffAttribs.starRating.toFixed(2),
                        )}dpp - ${osuDiffAttribs.starRating.toFixed(2)}pp`,
                });
            }

            message.channel.send(embedOptions);
        }
    }
};

export const config: EventUtil["config"] = {
    description: "Responsible for calculating beatmaps that are sent by users.",
    togglePermissions: ["ManageChannels"],
    toggleScope: ["GLOBAL", "GUILD", "CHANNEL"],
};
