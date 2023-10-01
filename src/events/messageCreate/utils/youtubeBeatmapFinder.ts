import {
    Message,
    EmbedBuilder,
    BaseMessageOptions,
    ChannelType,
    bold,
    underscore,
} from "discord.js";
import { EventUtil } from "structures/core/EventUtil";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { Symbols } from "@alice-enums/utils/Symbols";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapDifficultyHelper } from "@alice-utils/helpers/BeatmapDifficultyHelper";
import { YouTubeRESTManager } from "@alice-utils/managers/YouTubeRESTManager";
import { YouTubeVideoInformation } from "@alice-structures/youtube/YouTubeVideoInformation";
import { MapInfo, MapStats, Modes } from "@rian8337/osu-base";
import {
    DroidDifficultyAttributes,
    OsuDifficultyAttributes,
} from "@rian8337/osu-difficulty-calculator";
import { YoutubeBeatmapFinderLocalization } from "@alice-localization/events/messageCreate/youtubeBeatmapFinder/YoutubeBeatmapFinderLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import { CacheableDifficultyAttributes } from "@alice-structures/difficultyattributes/CacheableDifficultyAttributes";
import { DPPProcessorRESTManager } from "@alice-utils/managers/DPPProcessorRESTManager";
import { PPCalculationMethod } from "@alice-enums/utils/PPCalculationMethod";

export const run: EventUtil["run"] = async (_, message: Message) => {
    if (message.author.bot) {
        return;
    }

    const localization: YoutubeBeatmapFinderLocalization =
        new YoutubeBeatmapFinderLocalization(
            message.channel.type === ChannelType.DM
                ? await CommandHelper.getLocale(message.author)
                : await CommandHelper.getLocale(message.channel.id),
        );

    const ytRegex: RegExp =
        /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|&v(?:i)?=))([^#&?]+).*/;

    const calcParams: PerformanceCalculationParameters =
        BeatmapDifficultyHelper.getCalculationParamsFromMessage(
            message.content,
        );

    for (const arg of message.content.split(/\s+/g)) {
        const match: RegExpMatchArray | null = arg.match(ytRegex);

        if (!match) {
            continue;
        }

        const videoId: string = match[1];

        if (!videoId) {
            continue;
        }

        const data: YouTubeVideoInformation | null =
            await YouTubeRESTManager.getInformation(videoId);

        if (!data) {
            continue;
        }

        const description: string = data.snippet.description;

        // Limit to 3 beatmaps to prevent spam
        let validCount: number = 0;

        for (const link of description.split(/\s+/g)) {
            if (!link.startsWith("https://osu.ppy.sh/")) {
                continue;
            }

            if (validCount === 3) {
                break;
            }

            const beatmapID: number = BeatmapManager.getBeatmapID(link)[0];
            const beatmapsetID: number =
                BeatmapManager.getBeatmapsetID(link)[0];

            // Prioritize beatmap ID over beatmapset ID
            if (beatmapID) {
                const beatmapInfo: MapInfo<false> | null =
                    await BeatmapManager.getBeatmap(beatmapID, {
                        checkFile: false,
                    });

                if (!beatmapInfo) {
                    continue;
                }

                // Beatmap cache
                BeatmapManager.setChannelLatestBeatmap(
                    message.channel.id,
                    beatmapInfo.hash,
                );

                const embedOptions: BaseMessageOptions =
                    EmbedCreator.createBeatmapEmbed(
                        beatmapInfo,
                        undefined,
                        localization.language,
                    );

                const embed: EmbedBuilder = <EmbedBuilder>(
                    embedOptions.embeds![0]
                );

                embed.spliceFields(0, embed.data.fields!.length);

                message.channel.send(embedOptions);
            } else if (beatmapsetID) {
                // Retrieve beatmap file one by one to not overcreate requests
                const beatmapInformations: MapInfo[] =
                    await BeatmapManager.getBeatmaps(beatmapsetID, false);

                if (beatmapInformations.length === 0) {
                    return;
                }

                beatmapInformations.sort(
                    (a, b) =>
                        (b.totalDifficulty ?? 0) - (a.totalDifficulty ?? 0),
                );

                let string: string = "";

                if (beatmapInformations.length > 3) {
                    string = MessageCreator.createAccept(
                        localization.getTranslation("beatmapLimitation"),
                        beatmapInformations.length.toString(),
                    );
                }

                const firstBeatmap: MapInfo = beatmapInformations[0];

                const embedOptions: BaseMessageOptions =
                    EmbedCreator.createBeatmapEmbed(
                        firstBeatmap,
                        undefined,
                        localization.language,
                    );

                if (string) {
                    embedOptions.content = string;
                }

                // Empty files, we don't need it here.
                embedOptions.files = [];

                const embed: EmbedBuilder = <EmbedBuilder>(
                    embedOptions.embeds![0]
                );

                const stats: MapStats =
                    calcParams.customStatistics ?? new MapStats();

                embed
                    .spliceFields(0, embed.data.fields!.length)
                    .setTitle(
                        `${firstBeatmap.artist} - ${firstBeatmap.title} by ${firstBeatmap.creator}`,
                    )
                    .setColor(
                        BeatmapManager.getStatusColor(firstBeatmap.approved),
                    )
                    .setAuthor({ name: "Beatmap Information" })
                    .setURL(firstBeatmap.beatmapSetLink)
                    .setDescription(
                        `${BeatmapManager.showStatistics(
                            firstBeatmap,
                            1,
                            stats,
                        )}\n` +
                            `${bold("BPM")}: ${BeatmapManager.convertBPM(
                                firstBeatmap.bpm,
                                stats,
                            )} - ${bold(
                                "Length",
                            )}: ${BeatmapManager.convertTime(
                                firstBeatmap.hitLength,
                                firstBeatmap.totalLength,
                                stats,
                            )}`,
                    );

                for (const beatmapInfo of beatmapInformations) {
                    if (embed.data.fields!.length === 3) {
                        break;
                    }

                    const droidAttribs: CacheableDifficultyAttributes<DroidDifficultyAttributes> | null =
                        await DPPProcessorRESTManager.getDifficultyAttributes(
                            beatmapInfo.beatmapId,
                            Modes.droid,
                            PPCalculationMethod.live,
                            calcParams,
                        );

                    if (!droidAttribs) {
                        continue;
                    }

                    const osuAttribs: CacheableDifficultyAttributes<OsuDifficultyAttributes> | null =
                        await DPPProcessorRESTManager.getDifficultyAttributes(
                            beatmapInfo.beatmapId,
                            Modes.osu,
                            PPCalculationMethod.live,
                            calcParams,
                        );

                    if (!osuAttribs) {
                        continue;
                    }

                    embed.addFields({
                        name: `${underscore(
                            beatmapInfo.version,
                        )} (${droidAttribs.starRating.toFixed(2)} ${
                            Symbols.star
                        } | ${osuAttribs.starRating.toFixed(2)} ${
                            Symbols.star
                        })`,
                        value:
                            `${BeatmapManager.showStatistics(
                                beatmapInfo,
                                2,
                                stats,
                            )}\n` +
                            `${BeatmapManager.showStatistics(
                                beatmapInfo,
                                3,
                                stats,
                            )}\n` +
                            `${BeatmapManager.showStatistics(
                                beatmapInfo,
                                4,
                                stats,
                            )}\n` +
                            `${bold(
                                droidAttribs.starRating.toFixed(2),
                            )}dpp - ${osuAttribs.starRating.toFixed(2)}pp`,
                    });
                }

                message.channel.send(embedOptions);
            }

            ++validCount;
        }
    }
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for loading beatmaps that is linked from YouTube.",
    togglePermissions: ["ManageChannels"],
    toggleScope: ["GLOBAL", "GUILD", "CHANNEL"],
};
