import { Config } from "@alice-core/Config";
import { Symbols } from "@alice-enums/utils/Symbols";
import { EventUtil } from "structures/core/EventUtil";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapDifficultyHelper } from "@alice-utils/helpers/BeatmapDifficultyHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import {
    Message,
    EmbedBuilder,
    BaseMessageOptions,
    ChannelType,
    bold,
    underscore,
} from "discord.js";
import { DroidBeatmapDifficultyHelper } from "@alice-utils/helpers/DroidBeatmapDifficultyHelper";
import { OsuBeatmapDifficultyHelper } from "@alice-utils/helpers/OsuBeatmapDifficultyHelper";
import { MapInfo, MapStats } from "@rian8337/osu-base";
import {
    DroidDifficultyAttributes,
    DroidDifficultyCalculator,
    DroidPerformanceCalculator,
    OsuDifficultyAttributes,
    OsuDifficultyCalculator,
    OsuPerformanceCalculator,
} from "@rian8337/osu-difficulty-calculator";
import { UserBeatmapCalculationLocalization } from "@alice-localization/events/messageCreate/userBeatmapCalculation/UserBeatmapCalculationLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import { CacheableDifficultyAttributes } from "@alice-structures/difficultyattributes/CacheableDifficultyAttributes";
import { CacheManager } from "@alice-utils/managers/CacheManager";

export const run: EventUtil["run"] = async (_, message: Message) => {
    if (Config.maintenance || message.author.bot) {
        return;
    }

    const localization: UserBeatmapCalculationLocalization =
        new UserBeatmapCalculationLocalization(
            message.channel.type === ChannelType.DM
                ? await CommandHelper.getLocale(message.author)
                : await CommandHelper.getLocale(message.channel.id)
        );

    const calcParams: PerformanceCalculationParameters =
        BeatmapDifficultyHelper.getCalculationParamsFromMessage(
            message.content
        );

    for (const arg of message.content.split(/\s+/g)) {
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
                { checkFile: false }
            );

            if (!beatmapInfo) {
                continue;
            }

            // Beatmap cache
            BeatmapManager.setChannelLatestBeatmap(
                message.channel.id,
                beatmapInfo.hash
            );

            const droidCalcResult: PerformanceCalculationResult<
                DroidDifficultyCalculator,
                DroidPerformanceCalculator
            > | null =
                await new DroidBeatmapDifficultyHelper().calculateBeatmapPerformance(
                    beatmapInfo,
                    calcParams
                );

            const osuPerfCalcResult: PerformanceCalculationResult<
                OsuDifficultyCalculator,
                OsuPerformanceCalculator
            > | null =
                await new OsuBeatmapDifficultyHelper().calculateBeatmapPerformance(
                    beatmapInfo,
                    calcParams
                );

            if (!droidCalcResult || !osuPerfCalcResult) {
                continue;
            }

            const calcEmbedOptions: BaseMessageOptions =
                EmbedCreator.createCalculationEmbed(
                    beatmapInfo,
                    calcParams,
                    droidCalcResult.result.difficultyAttributes,
                    osuPerfCalcResult.result.difficultyAttributes,
                    droidCalcResult,
                    osuPerfCalcResult,
                    undefined,
                    localization.language
                );

            let string: string = "";

            if (message.content.includes("-d")) {
                string += `${localization.getTranslation("droidStars")}: ${
                    droidCalcResult.starRatingInfo
                }\n${localization.getTranslation(
                    "droidPP"
                )}: ${droidCalcResult.result.toString()}\n`;
            }

            if (message.content.includes("-p")) {
                string += `${localization.getTranslation("pcStars")}: ${
                    osuPerfCalcResult.starRatingInfo
                }\n${localization.getTranslation(
                    "pcPP"
                )}: ${osuPerfCalcResult.result.toString()}`;
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

            beatmapInformations.sort(
                (a, b) => b.totalDifficulty - a.totalDifficulty
            );

            let string: string = "";

            if (beatmapInformations.length > 3) {
                string = MessageCreator.createAccept(
                    localization.getTranslation("beatmapLimitation"),
                    beatmapInformations.length.toString()
                );
            }

            const firstBeatmap: MapInfo = beatmapInformations[0];

            const embedOptions: BaseMessageOptions =
                EmbedCreator.createBeatmapEmbed(
                    firstBeatmap,
                    undefined,
                    localization.language
                );

            if (string) {
                embedOptions.content = string;
            }

            // Empty files first, we will reenter all attachments later
            embedOptions.files = [];

            const embed: EmbedBuilder = EmbedBuilder.from(
                embedOptions.embeds![0]
            );

            const stats: MapStats =
                calcParams.customStatistics ?? new MapStats();

            embed
                .spliceFields(0, embed.data.fields!.length)
                .setTitle(
                    `${firstBeatmap.artist} - ${firstBeatmap.title} by ${firstBeatmap.creator}`
                )
                .setColor(firstBeatmap.statusColor)
                .setAuthor({ name: "Beatmap Information" })
                .setURL(`https://osu.ppy.sh/s/${firstBeatmap.beatmapsetID}`)
                .setDescription(
                    `${firstBeatmap.showStatistics(1, stats)}\n` +
                        `${bold("BPM")}: ${firstBeatmap.convertBPM(
                            stats
                        )} - ${bold("Length")}: ${firstBeatmap.convertTime(
                            stats
                        )}`
                );

            for (const beatmapInfo of beatmapInformations) {
                if (embed.data.fields!.length === 3) {
                    break;
                }

                const { customStatistics } = calcParams;
                const { droid: droidCacheManager, osu: osuCacheManager } =
                    CacheManager.difficultyAttributesCache.live;

                const droidAttributes: CacheableDifficultyAttributes<DroidDifficultyAttributes> | null =
                    droidCacheManager.getDifficultyAttributes(
                        beatmapInfo,
                        droidCacheManager.getAttributeName(
                            customStatistics?.mods,
                            customStatistics?.oldStatistics,
                            customStatistics?.speedMultiplier,
                            customStatistics?.isForceAR
                                ? customStatistics.ar
                                : undefined
                        )
                    ) ??
                    (
                        await new DroidBeatmapDifficultyHelper().calculateBeatmapDifficulty(
                            beatmapInfo.hash,
                            calcParams
                        )
                    )?.cachedAttributes ??
                    null;

                const osuAttributes: CacheableDifficultyAttributes<OsuDifficultyAttributes> | null =
                    osuCacheManager.getDifficultyAttributes(
                        beatmapInfo,
                        osuCacheManager.getAttributeName(
                            customStatistics?.mods,
                            customStatistics?.oldStatistics,
                            customStatistics?.speedMultiplier,
                            customStatistics?.isForceAR
                                ? customStatistics.ar
                                : undefined
                        )
                    ) ??
                    (
                        await new OsuBeatmapDifficultyHelper().calculateBeatmapDifficulty(
                            beatmapInfo.hash,
                            calcParams
                        )
                    )?.cachedAttributes ??
                    null;

                if (!droidAttributes || !osuAttributes) {
                    continue;
                }

                embed.addFields({
                    name: `${underscore(
                        beatmapInfo.version
                    )} (${droidAttributes.starRating.toFixed(2)} ${
                        Symbols.star
                    } | ${osuAttributes.starRating.toFixed(2)} ${
                        Symbols.star
                    })`,
                    value:
                        `${beatmapInfo.showStatistics(2, stats)}\n` +
                        `${beatmapInfo.showStatistics(3, stats)}\n` +
                        `${beatmapInfo.showStatistics(4, stats)}\n` +
                        `${bold(
                            droidAttributes.starRating.toFixed(2)
                        )}dpp - ${osuAttributes.starRating.toFixed(2)}pp`,
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
