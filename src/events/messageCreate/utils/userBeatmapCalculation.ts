import { Config } from "@alice-core/Config";
import { Symbols } from "@alice-enums/utils/Symbols";
import { EventUtil } from "structures/core/EventUtil";
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
import { MapInfo, MapStats, Modes } from "@rian8337/osu-base";
import {
    DroidDifficultyAttributes,
    OsuDifficultyAttributes,
} from "@rian8337/osu-difficulty-calculator";
import { UserBeatmapCalculationLocalization } from "@alice-localization/events/messageCreate/userBeatmapCalculation/UserBeatmapCalculationLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import { CacheableDifficultyAttributes } from "@alice-structures/difficultyattributes/CacheableDifficultyAttributes";
import { CompleteCalculationAttributes } from "@alice-structures/difficultyattributes/CompleteCalculationAttributes";
import { DroidPerformanceAttributes } from "@alice-structures/difficultyattributes/DroidPerformanceAttributes";
import { DPPProcessorRESTManager } from "@alice-utils/managers/DPPProcessorRESTManager";
import { PPCalculationMethod } from "@alice-enums/utils/PPCalculationMethod";
import { OsuPerformanceAttributes } from "@alice-structures/difficultyattributes/OsuPerformanceAttributes";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";

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

        const beatmapId: number = BeatmapManager.getBeatmapID(arg)[0];
        const beatmapsetID: number = BeatmapManager.getBeatmapsetID(arg)[0];

        // Prioritize beatmap ID over beatmapset ID
        if (beatmapId) {
            const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
                beatmapId,
                { checkFile: false }
            );

            if (!beatmapInfo) {
                continue;
            }

            calcParams.recalculateAccuracy(beatmapInfo.objects);

            // Beatmap cache
            BeatmapManager.setChannelLatestBeatmap(
                message.channel.id,
                beatmapInfo.hash
            );

            const droidAttribs: CompleteCalculationAttributes<
                DroidDifficultyAttributes,
                DroidPerformanceAttributes
            > | null = await DPPProcessorRESTManager.getPerformanceAttributes(
                beatmapId,
                Modes.droid,
                PPCalculationMethod.live,
                calcParams
            );

            if (!droidAttribs) {
                continue;
            }

            const osuAttribs: CompleteCalculationAttributes<
                OsuDifficultyAttributes,
                OsuPerformanceAttributes
            > | null = await DPPProcessorRESTManager.getPerformanceAttributes(
                beatmapId,
                Modes.osu,
                PPCalculationMethod.live,
                calcParams
            );

            if (!osuAttribs) {
                continue;
            }

            const calcEmbedOptions: BaseMessageOptions =
                EmbedCreator.createCalculationEmbed(
                    beatmapInfo,
                    calcParams,
                    droidAttribs.difficulty,
                    osuAttribs.difficulty,
                    droidAttribs.performance,
                    osuAttribs.performance,
                    localization.language
                );

            let string: string = "";

            if (message.content.includes("-d")) {
                string += `${localization.getTranslation(
                    "droidStars"
                )}: ${DPPHelper.getDroidDifficultyAttributesInfo(
                    droidAttribs.difficulty
                )}\n${localization.getTranslation(
                    "droidPP"
                )}: ${DPPHelper.getDroidPerformanceAttributesInfo(
                    droidAttribs.performance
                )}\n`;
            }

            if (message.content.includes("-p")) {
                string += `${localization.getTranslation(
                    "pcStars"
                )}: ${DPPHelper.getOsuDifficultyAttributesInfo(
                    osuAttribs.difficulty
                )}\n${localization.getTranslation(
                    "pcPP"
                )}: ${DPPHelper.getOsuPerformanceAttributesInfo(
                    osuAttribs.performance
                )}`;
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
                .setColor(BeatmapManager.getStatusColor(firstBeatmap.approved))
                .setAuthor({ name: "Beatmap Information" })
                .setURL(`https://osu.ppy.sh/s/${firstBeatmap.beatmapsetID}`)
                .setDescription(
                    `${BeatmapManager.showStatistics(
                        firstBeatmap,
                        1,
                        stats
                    )}\n` +
                        `${bold("BPM")}: ${BeatmapManager.convertBPM(
                            firstBeatmap.bpm,
                            stats
                        )} - ${bold("Length")}: ${BeatmapManager.convertTime(
                            firstBeatmap.hitLength,
                            firstBeatmap.totalLength,
                            stats
                        )}`
                );

            for (const beatmapInfo of beatmapInformations) {
                if (embed.data.fields!.length === 3) {
                    break;
                }

                const droidDiffAttribs: CacheableDifficultyAttributes<DroidDifficultyAttributes> | null =
                    await DPPProcessorRESTManager.getDifficultyAttributes(
                        beatmapInfo.hash,
                        Modes.droid,
                        PPCalculationMethod.live,
                        calcParams
                    );

                const osuDiffAttribs: CacheableDifficultyAttributes<OsuDifficultyAttributes> | null =
                    await DPPProcessorRESTManager.getDifficultyAttributes(
                        beatmapInfo.hash,
                        Modes.osu,
                        PPCalculationMethod.live,
                        calcParams
                    );

                if (!droidDiffAttribs || !osuDiffAttribs) {
                    continue;
                }

                embed.addFields({
                    name: `${underscore(
                        beatmapInfo.version
                    )} (${droidDiffAttribs.starRating.toFixed(2)} ${
                        Symbols.star
                    } | ${osuDiffAttribs.starRating.toFixed(2)} ${
                        Symbols.star
                    })`,
                    value:
                        `${BeatmapManager.showStatistics(
                            beatmapInfo,
                            2,
                            stats
                        )}\n` +
                        `${BeatmapManager.showStatistics(
                            beatmapInfo,
                            3,
                            stats
                        )}\n` +
                        `${BeatmapManager.showStatistics(
                            beatmapInfo,
                            4,
                            stats
                        )}\n` +
                        `${bold(
                            droidDiffAttribs.starRating.toFixed(2)
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
