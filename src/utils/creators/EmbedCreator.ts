import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ColorResolvable,
    EmbedBuilder,
    Guild,
    GuildEmoji,
    GuildMember,
    BaseMessageOptions,
    RepliableInteraction,
    User,
    bold,
    userMention,
    underscore,
    channelMention,
} from "discord.js";
import { Config } from "@alice-core/Config";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { Symbols } from "@alice-enums/utils/Symbols";
import { Challenge } from "@alice-database/utils/aliceDb/Challenge";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { ClanAuction } from "@alice-database/utils/aliceDb/ClanAuction";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TournamentMatch } from "@alice-database/utils/elainaDb/TournamentMatch";
import { DifficultyCalculationParameters } from "@alice-utils/dpp/DifficultyCalculationParameters";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import { ScoreRank } from "structures/utils/ScoreRank";
import { MapShare } from "@alice-database/utils/aliceDb/MapShare";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { MusicQueue } from "@alice-utils/music/MusicQueue";
import { BeatmapDifficultyHelper } from "@alice-utils/helpers/BeatmapDifficultyHelper";
import {
    MapInfo,
    Accuracy,
    MapStats,
    Precision,
    HitObject,
    Slider,
    SliderTick,
    SliderTail,
    ModUtil,
    Modes,
} from "@rian8337/osu-base";
import {
    DroidDifficultyAttributes,
    OsuDifficultyAttributes,
} from "@rian8337/osu-difficulty-calculator";
import {
    DroidDifficultyAttributes as RebalanceDroidDifficultyAttributes,
    OsuDifficultyAttributes as RebalanceOsuDifficultyAttributes,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import {
    ReplayData,
    ReplayObjectData,
    HitResult,
    HitErrorInformation,
} from "@rian8337/osu-droid-replay-analyzer";
import { Score } from "@rian8337/osu-droid-utilities";
import { Language } from "@alice-localization/base/Language";
import {
    EmbedCreatorLocalization,
    EmbedCreatorStrings,
} from "@alice-localization/utils/creators/EmbedCreator/EmbedCreatorLocalization";
import { Warning } from "@alice-database/utils/aliceDb/Warning";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { CacheableDifficultyAttributes } from "@alice-structures/difficultyattributes/CacheableDifficultyAttributes";
import { ReplayHelper } from "@alice-utils/helpers/ReplayHelper";
import { DroidPerformanceAttributes } from "@alice-structures/difficultyattributes/DroidPerformanceAttributes";
import { OsuPerformanceAttributes } from "@alice-structures/difficultyattributes/OsuPerformanceAttributes";
import { CompleteCalculationAttributes } from "@alice-structures/difficultyattributes/CompleteCalculationAttributes";
import { DPPProcessorRESTManager } from "@alice-utils/managers/DPPProcessorRESTManager";
import { PPCalculationMethod } from "@alice-enums/utils/PPCalculationMethod";
import { RecentPlay } from "@alice-database/utils/aliceDb/RecentPlay";

/**
 * Utility to create message embeds.
 */
export abstract class EmbedCreator {
    private static readonly botSign: string = "Alice Synthesis Thirty";

    /**
     * Creates a normal embed.
     *
     * @param embedOptions Options to override default message embed behavior.
     */
    static createNormalEmbed(
        embedOptions: {
            /**
             * The author of the embed.
             */
            author?: User;

            /**
             * The color of the embed.
             */
            color?: ColorResolvable;

            /**
             * The footer text of the embed. If specified, will be written before bot's sign.
             */
            footerText?: string;

            /**
             * Whether to use a timestamp.
             */
            timestamp?: boolean;
        } = {},
    ): EmbedBuilder {
        const iconURL: string = ArrayHelper.getRandomArrayElement(
            Config.avatarList,
        );

        const embed: EmbedBuilder = new EmbedBuilder().setFooter({
            text: this.botSign,
            iconURL: iconURL,
        });

        if (embedOptions.author) {
            embed.setAuthor({
                name: embedOptions.author.tag,
                iconURL: embedOptions.author.avatarURL()!,
            });
        }

        if (embedOptions.color) {
            embed.setColor(embedOptions.color);
        }

        if (embedOptions.footerText) {
            embed.setFooter({
                text: `${embedOptions.footerText} | ${this.botSign}`,
                iconURL: iconURL,
            });
        }

        if (embedOptions.timestamp) {
            embed.setTimestamp(new Date());
        }

        return embed;
    }

    /**
     * Creates a beatmap embed.
     *
     * @param beatmapInfo The beatmap to create the beatmap embed from.
     * @param calculationParams The calculation parameters to be applied towards beatmap statistics.
     * @param language The locale of the user who attempted to create the beatmap embed. Defaults to English.
     */
    static createBeatmapEmbed(
        beatmapInfo: MapInfo,
        calculationParams?: DifficultyCalculationParameters,
        language: Language = "en",
    ): BaseMessageOptions {
        const localization: EmbedCreatorLocalization =
            new EmbedCreatorLocalization(language);

        const embed: EmbedBuilder = this.createNormalEmbed({
            color: <ColorResolvable>(
                BeatmapManager.getBeatmapDifficultyColor(
                    parseFloat((beatmapInfo.totalDifficulty ?? 0).toFixed(2)),
                )
            ),
        });

        const totalDifficulty: number = beatmapInfo.totalDifficulty ?? 0;

        embed
            .setAuthor({
                name: localization.getTranslation("beatmapInfo"),
                iconURL: `attachment://osu-${totalDifficulty.toFixed(2)}.png`,
            })
            .setTitle(
                BeatmapManager.showStatistics(
                    beatmapInfo,
                    0,
                    calculationParams?.customStatistics,
                ),
            )
            .setDescription(
                BeatmapManager.showStatistics(
                    beatmapInfo,
                    1,
                    calculationParams?.customStatistics,
                ) +
                    "\n" +
                    BeatmapManager.showStatistics(
                        beatmapInfo,
                        2,
                        calculationParams?.customStatistics,
                    ),
            )
            .setURL(`https://osu.ppy.sh/b/${beatmapInfo.beatmapID}`)
            .addFields(
                {
                    name: bold(
                        localization.getTranslation("beatmapDroidStatistics"),
                    ),
                    value: BeatmapManager.showStatistics(
                        beatmapInfo,
                        3,
                        calculationParams?.customStatistics,
                    ),
                },
                {
                    name: bold(
                        localization.getTranslation("beatmapOsuStatistics"),
                    ),
                    value: BeatmapManager.showStatistics(
                        beatmapInfo,
                        4,
                        calculationParams?.customStatistics,
                    ),
                },
                {
                    name: bold(
                        localization.getTranslation("beatmapGeneralStatistics"),
                    ),
                    value: BeatmapManager.showStatistics(
                        beatmapInfo,
                        5,
                        calculationParams?.customStatistics,
                    ),
                },
                {
                    name: BeatmapManager.showStatistics(
                        beatmapInfo,
                        6,
                        calculationParams?.customStatistics,
                    ),
                    value: BeatmapManager.showStatistics(
                        beatmapInfo,
                        7,
                        calculationParams?.customStatistics,
                    ),
                },
                {
                    name: localization.getTranslation("starRating"),
                    value: `${Symbols.star.repeat(
                        Math.floor(totalDifficulty),
                    )} ${bold(
                        `${totalDifficulty.toFixed(
                            2,
                        )} ${localization.getTranslation("pcStars")}`,
                    )}`,
                },
            );

        return {
            embeds: [embed],
            files: [
                BeatmapManager.getBeatmapDifficultyIconAttachment(
                    parseFloat(totalDifficulty.toFixed(2)),
                ),
            ],
        };
    }

    /**
     * Creates an embed for displaying DPP list.
     *
     * @param interaction The interaction that triggered the embed creation.
     * @param playerInfo The player's information.
     * @param ppRank The DPP rank of the player.
     * @param language The locale of the user who attempted to create the embed. Defaults to English.
     * @returns The embed.
     */
    static async createDPPListEmbed(
        interaction: RepliableInteraction,
        playerInfo: UserBind,
        ppRank?: number,
        language: Language = "en",
    ): Promise<EmbedBuilder> {
        const localization: EmbedCreatorLocalization =
            new EmbedCreatorLocalization(language);

        const embed: EmbedBuilder = this.createNormalEmbed({
            author: interaction.user,
            color: (<GuildMember | null>interaction.member)?.displayColor,
        });

        ppRank ??=
            await DatabaseManager.elainaDb.collections.userBind.getUserDPPRank(
                playerInfo.pptotal,
            );

        embed.setDescription(
            `${bold(
                `${StringHelper.formatString(
                    localization.getTranslation("ppProfileTitle"),
                    `${userMention(playerInfo.discordid)} (${
                        playerInfo.username
                    })`,
                )}`,
            )}\n` +
                `${localization.getTranslation("totalPP")}: ${bold(
                    `${playerInfo.pptotal.toFixed(
                        2,
                    )} pp (#${ppRank.toLocaleString(
                        LocaleHelper.convertToBCP47(language),
                    )})`,
                )}\n` +
                `${localization.getTranslation(
                    "recommendedStarRating",
                )}: ${bold(
                    `${(Math.pow(playerInfo.pptotal, 0.4) * 0.225).toFixed(2)}${
                        Symbols.star
                    }`,
                )}\n` +
                `Recalculated: ${bold(
                    playerInfo.dppRecalcComplete ? "Yes" : "No",
                )}\n` +
                `[${localization.getTranslation(
                    "ppProfile",
                )}](https://droidpp.osudroid.moe/profile/${playerInfo.uid})`,
        );

        return embed;
    }

    /**
     * Creates an embed for input detector.
     *
     * @param interaction The interaction that triggered the input detector.
     * @param title The title of the embed.
     * @param description The description of the embed.
     * @returns The embed.
     */
    static createInputEmbed(
        interaction: RepliableInteraction,
        title: string,
        description: string,
        language: Language = "en",
    ): EmbedBuilder {
        const embed: EmbedBuilder = this.createNormalEmbed({
            author: interaction.user,
            color: (<GuildMember | null>interaction.member)?.displayColor,
            footerText:
                this.getLocalization(language).getTranslation("exitMenu"),
        });

        embed.setTitle(title).setDescription(description);

        return embed;
    }

    /**
     * Creates an embed with beatmap calculation result.
     *
     * @param beatmap The beatmap being calculated.
     * @param calculationParams The parameters of the calculation. If `PerformanceCalculationParameters` is specified and `droidPerfCalcResult` and `osuPerfCalcResult` are specified, the beatmap's performance values will be shown.
     * @param droidDiffAttribs The osu!droid difficulty attributes.
     * @param osuDiffAttribs The osu!standard difficulty attributes.
     * @param droidPerfAttribs The osu!droid performance attributes.
     * @param osuPerfAttribs The osu!standard performance attributes.
     * @param language The locale of the user who attempted to create the embed. Defaults to English.
     * @returns The message options that contains the embed.
     */
    static createCalculationEmbed(
        beatmap: MapInfo,
        calculationParams: DifficultyCalculationParameters,
        droidDiffAttribs: CacheableDifficultyAttributes<
            DroidDifficultyAttributes | RebalanceDroidDifficultyAttributes
        >,
        osuDiffAttribs: CacheableDifficultyAttributes<
            OsuDifficultyAttributes | RebalanceOsuDifficultyAttributes
        >,
        droidPerfAttribs?: DroidPerformanceAttributes,
        osuPerfAttribs?: OsuPerformanceAttributes,
        language: Language = "en",
    ): BaseMessageOptions {
        const localization: EmbedCreatorLocalization =
            this.getLocalization(language);

        const embedOptions: BaseMessageOptions = this.createBeatmapEmbed(
            beatmap,
            calculationParams,
            language,
        );

        const embed: EmbedBuilder = EmbedBuilder.from(embedOptions.embeds![0]);
        const files: NonNullable<BaseMessageOptions["files"]> =
            embedOptions.files!;

        if (
            calculationParams instanceof PerformanceCalculationParameters &&
            droidPerfAttribs &&
            osuPerfAttribs
        ) {
            const combo: number =
                calculationParams.combo ??
                beatmap.maxCombo ??
                droidDiffAttribs.maxCombo;
            // Recompute accuracy to consider amount of objects.
            calculationParams.accuracy = new Accuracy({
                ...calculationParams.accuracy,
                nobjects: beatmap.objects,
            });
            const { accuracy, customStatistics } = calculationParams;

            embed
                .setColor(
                    <ColorResolvable>(
                        BeatmapManager.getBeatmapDifficultyColor(
                            osuDiffAttribs.starRating,
                        )
                    ),
                )
                .spliceFields(embed.data.fields!.length - 2, 2)
                .addFields(
                    {
                        name: BeatmapManager.showStatistics(
                            beatmap,
                            6,
                            customStatistics,
                        ),
                        value: `${BeatmapManager.showStatistics(
                            beatmap,
                            7,
                            customStatistics,
                        )}\n${bold(
                            `${localization.getTranslation("result")}`,
                        )}: ${combo}/${beatmap.maxCombo}x | ${(
                            accuracy.value() * 100
                        ).toFixed(2)}% | [${accuracy.n300}/${accuracy.n100}/${
                            accuracy.n50
                        }/${accuracy.nmiss}]`,
                    },
                    {
                        name: `${bold(
                            localization.getTranslation("droidPP"),
                        )}: ${underscore(
                            `${droidPerfAttribs.total.toFixed(2)} pp`,
                        )}${
                            calculationParams.isEstimated
                                ? ` (${localization.getTranslation(
                                      "estimated",
                                  )})`
                                : ""
                        } - ${droidDiffAttribs.starRating.toFixed(2)}${
                            Symbols.star
                        }`,
                        value: `${bold(
                            localization.getTranslation("pcPP"),
                        )}: ${osuPerfAttribs.total.toFixed(2)} pp${
                            calculationParams.isEstimated
                                ? ` (${localization.getTranslation(
                                      "estimated",
                                  )})`
                                : ""
                        } - ${osuDiffAttribs.starRating.toFixed(2)}${
                            Symbols.star
                        }`,
                    },
                );
        } else {
            embed
                .setColor(
                    <ColorResolvable>(
                        BeatmapManager.getBeatmapDifficultyColor(
                            osuDiffAttribs.starRating,
                        )
                    ),
                )
                .spliceFields(embed.data.fields!.length - 1, 1)
                .addFields({
                    name: bold(localization.getTranslation("starRating")),
                    value:
                        `${Symbols.star.repeat(
                            Math.min(
                                10,
                                Math.floor(droidDiffAttribs.starRating),
                            ),
                        )} ${droidDiffAttribs.starRating.toFixed(
                            2,
                        )} ${localization.getTranslation("droidStars")}\n` +
                        `${Symbols.star.repeat(
                            Math.min(10, Math.floor(osuDiffAttribs.starRating)),
                        )} ${osuDiffAttribs.starRating.toFixed(
                            2,
                        )} ${localization.getTranslation("pcStars")}`,
                });
        }

        if (
            beatmap.totalDifficulty !== null &&
            !Precision.almostEqualsNumber(
                osuDiffAttribs.starRating,
                beatmap.totalDifficulty,
            )
        ) {
            // Recreate difficulty icon if difficulty is different.
            files.length = 0;

            files.push(
                BeatmapManager.getBeatmapDifficultyIconAttachment(
                    osuDiffAttribs.starRating,
                ),
            );

            embed.setAuthor({
                name: localization.getTranslation("beatmapInfo"),
                iconURL: `attachment://osu-${osuDiffAttribs.starRating.toFixed(
                    2,
                )}.png`,
            });
        }

        return {
            embeds: [embed],
            files: files,
        };
    }

    /**
     * Creates a recent play embed.
     *
     * @param score The score to create recent play from.
     * @param playerAvatarURL The avatar URL of the player.
     * @param embedColor The color of the embed.
     * @param droidAttribs The osu!droid complete attributes of the score. If unspecified, the score will be computed on fly.
     * @param osuAttribs The osu!standard complete attributes of the score. If unspecified, the score will be computed on fly.
     * @param language The locale of the user who requested the recent play embed. Defaults to English.
     * @returns The embed.
     */
    static async createRecentPlayEmbed(
        score: Score | RecentPlay,
        playerAvatarURL: string,
        embedColor?: ColorResolvable,
        droidAttribs?: CompleteCalculationAttributes<
            DroidDifficultyAttributes,
            DroidPerformanceAttributes
        > | null,
        osuAttribs?: CompleteCalculationAttributes<
            OsuDifficultyAttributes,
            OsuPerformanceAttributes
        > | null,
        language: Language = "en",
    ): Promise<EmbedBuilder> {
        const localization: EmbedCreatorLocalization =
            this.getLocalization(language);

        const BCP47: string = LocaleHelper.convertToBCP47(language);

        const arrow: Symbols = Symbols.rightArrowSmall;

        const embed: EmbedBuilder = this.createNormalEmbed({
            color: embedColor,
            footerText: StringHelper.formatString(
                localization.getTranslation("dateAchieved"),
                DateTimeFormatHelper.dateToLocaleString(score.date, language),
            ),
        });

        embed.setAuthor({
            name: `${score.title} ${score.completeModString}`,
            iconURL: playerAvatarURL,
        });

        if (droidAttribs === undefined && osuAttribs !== null) {
            droidAttribs =
                score instanceof Score
                    ? await DPPProcessorRESTManager.getOnlineScoreAttributes(
                          score.scoreID,
                          Modes.droid,
                          PPCalculationMethod.live,
                      )
                    : score.droidAttribs;
        }

        if (osuAttribs === undefined && droidAttribs !== null) {
            osuAttribs =
                score instanceof Score
                    ? await DPPProcessorRESTManager.getOnlineScoreAttributes(
                          score.scoreID,
                          Modes.osu,
                          PPCalculationMethod.live,
                      )
                    : score.osuAttribs;
        }

        let beatmapInformation: string = `${arrow} ${BeatmapManager.getRankEmote(
            <ScoreRank>score.rank,
        )} ${arrow} `;

        if (!droidAttribs || !osuAttribs) {
            beatmapInformation +=
                `${(score.accuracy.value() * 100).toFixed(2)}%\n` +
                `${arrow} ${score.score.toLocaleString(BCP47)} ${arrow} ${
                    score.combo
                }x ${arrow} [${score.accuracy.n300}/${score.accuracy.n100}/${
                    score.accuracy.n50
                }/${score.accuracy.nmiss}]`;

            embed.setDescription(beatmapInformation);
            return embed;
        }

        const beatmap: MapInfo = (await BeatmapManager.getBeatmap(score.hash, {
            checkFile: false,
        }))!;

        embed
            .setAuthor({
                name: `${beatmap.fullTitle} ${
                    score.completeModString
                } [${droidAttribs.difficulty.starRating.toFixed(2)}${
                    Symbols.star
                } | ${osuAttribs.difficulty.starRating.toFixed(2)}${
                    Symbols.star
                }]`,
                iconURL: playerAvatarURL,
                url: `https://osu.ppy.sh/b/${beatmap.beatmapID}`,
            })
            .setThumbnail(
                `https://b.ppy.sh/thumb/${beatmap.beatmapsetID}l.jpg`,
            );

        beatmapInformation += `${bold(
            `${droidAttribs.performance.total.toFixed(2)}DPP`,
        )} | ${bold(`${osuAttribs.performance.total.toFixed(2)}PP`)} `;

        // Some beatmaps return `null` max combo from osu! API, i.e. /b/1462961.
        const maxCombo: number =
            beatmap.maxCombo ?? droidAttribs.difficulty.maxCombo;

        if (score.accuracy.nmiss > 0 || score.combo < maxCombo) {
            const calcParams: PerformanceCalculationParameters =
                BeatmapDifficultyHelper.getCalculationParamsFromScore(score);

            calcParams.combo = maxCombo;
            calcParams.accuracy = new Accuracy({
                n300: score.accuracy.n300 + score.accuracy.nmiss,
                n100: score.accuracy.n100,
                n50: score.accuracy.n50,
                nmiss: 0,
            });

            const droidFcAttribs: CompleteCalculationAttributes<
                DroidDifficultyAttributes,
                DroidPerformanceAttributes
            > | null = await DPPProcessorRESTManager.getPerformanceAttributes(
                score.hash,
                Modes.droid,
                PPCalculationMethod.live,
                calcParams,
            );

            const osuFcAttribs: CompleteCalculationAttributes<
                OsuDifficultyAttributes,
                OsuPerformanceAttributes
            > | null = await DPPProcessorRESTManager.getPerformanceAttributes(
                score.hash,
                Modes.osu,
                PPCalculationMethod.live,
                calcParams,
            );

            if (droidFcAttribs && osuFcAttribs) {
                beatmapInformation += `(${droidFcAttribs.performance.total.toFixed(
                    2,
                )}DPP, ${osuFcAttribs.performance.total.toFixed(
                    2,
                )}PP ${StringHelper.formatString(
                    localization.getTranslation("forFC"),
                    (calcParams.accuracy.value() * 100).toFixed(2) + "%",
                )}) `;
            }
        }

        beatmapInformation +=
            `${arrow} ${(score.accuracy.value() * 100).toFixed(2)}%\n` +
            `${arrow} ${score.score.toLocaleString(BCP47)} ${arrow} ${
                score.combo
            }x/${maxCombo}x ${arrow} [${score.accuracy.n300}/${
                score.accuracy.n100
            }/${score.accuracy.n50}/${score.accuracy.nmiss}]`;
        let hitError: HitErrorInformation | null | undefined;

        if (score instanceof Score) {
            await ReplayHelper.analyzeReplay(score);

            const replayData: ReplayData | undefined | null =
                score.replay?.data;
            await beatmap.retrieveBeatmapFile();

            if (replayData && beatmap.hasDownloadedBeatmap()) {
                score.replay!.beatmap ??= beatmap.beatmap!;

                // Get amount of slider ticks and ends hit
                let collectedSliderTicks: number = 0;
                let collectedSliderEnds: number = 0;

                for (let i = 0; i < replayData.hitObjectData.length; ++i) {
                    // Using droid star rating as legacy slider tail doesn't exist.
                    const object: HitObject =
                        beatmap.beatmap!.hitObjects.objects[i];
                    const objectData: ReplayObjectData =
                        replayData.hitObjectData[i];

                    if (
                        objectData.result === HitResult.miss ||
                        !(object instanceof Slider)
                    ) {
                        continue;
                    }

                    // Exclude the head circle.
                    for (let j = 1; j < object.nestedHitObjects.length; ++j) {
                        const nested: HitObject = object.nestedHitObjects[j];

                        if (!objectData.tickset[j - 1]) {
                            continue;
                        }

                        if (nested instanceof SliderTick) {
                            ++collectedSliderTicks;
                        } else if (nested instanceof SliderTail) {
                            ++collectedSliderEnds;
                        }
                    }
                }

                beatmapInformation += `\n${arrow} ${collectedSliderTicks}/${
                    beatmap.beatmap!.hitObjects.sliderTicks
                } ${localization.getTranslation(
                    "sliderTicks",
                )} ${arrow} ${collectedSliderEnds}/${
                    beatmap.beatmap!.hitObjects.sliderEnds
                } ${localization.getTranslation("sliderEnds")}`;

                // Get hit error average and UR
                hitError = score.replay!.calculateHitError()!;
            }
        } else {
            hitError = score.hitError;

            if (score.sliderTickInformation || score.sliderEndInformation) {
                beatmapInformation += `\n`;

                if (score.sliderTickInformation) {
                    beatmapInformation += ` ${arrow} ${
                        score.sliderTickInformation.obtained
                    }/${
                        score.sliderTickInformation.total
                    } ${localization.getTranslation("sliderTicks")}`;
                }

                if (score.sliderEndInformation) {
                    beatmapInformation += ` ${arrow} ${
                        score.sliderEndInformation.obtained
                    }/${
                        score.sliderEndInformation.total
                    } ${localization.getTranslation("sliderEnds")}`;
                }
            }
        }

        if (hitError) {
            beatmapInformation += `\n${arrow} ${hitError.negativeAvg.toFixed(
                2,
            )}ms - ${hitError.positiveAvg.toFixed(
                2,
            )}ms ${localization.getTranslation(
                "hitErrorAvg",
            )} ${arrow} ${hitError.unstableRate.toFixed(2)} UR`;
        }

        const {
            tapPenalty,
            aimSliderCheesePenalty,
            flashlightSliderCheesePenalty,
            visualSliderCheesePenalty,
        } = droidAttribs.performance;

        const isThreeFinger: boolean = tapPenalty !== 1;
        const isSliderCheese: boolean = [
            aimSliderCheesePenalty,
            flashlightSliderCheesePenalty,
            visualSliderCheesePenalty,
        ].some((v) => v !== 1);

        if (isThreeFinger || isSliderCheese) {
            const str: string[] = [];

            if (isThreeFinger) {
                str.push(localization.getTranslation("threeFinger"));
            }
            if (isSliderCheese) {
                str.push(localization.getTranslation("sliderCheese"));
            }

            beatmapInformation += `\n${arrow} ${localization.getTranslation(
                "penalties",
            )}: ${str.join(", ")}`;
        }

        embed.setDescription(beatmapInformation);

        return embed;
    }

    /**
     * Creates a challenge embed.
     *
     * @param challenge The challenge to create the challenge embed for.
     * @param language The locale to create the embed for. Defaults to English.
     * @param graphColor The color of the strain graph in the embed.
     * @returns The options for the embed.
     */
    static async createChallengeEmbed(
        challenge: Challenge,
        graphColor?: string,
        language: Language = "en",
    ): Promise<BaseMessageOptions | null> {
        const localization: EmbedCreatorLocalization =
            this.getLocalization(language);

        const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
            challenge.beatmapid,
            { checkFile: false },
        );

        if (!beatmapInfo) {
            return null;
        }

        const calcParams: DifficultyCalculationParameters =
            new DifficultyCalculationParameters(
                new MapStats({
                    mods: ModUtil.pcStringToMods(challenge.constrain),
                }),
            );

        const droidDiffAttribs: CacheableDifficultyAttributes<DroidDifficultyAttributes> | null =
            await DPPProcessorRESTManager.getDifficultyAttributes(
                challenge.beatmapid,
                Modes.droid,
                PPCalculationMethod.live,
                calcParams,
            );

        if (!droidDiffAttribs) {
            return null;
        }

        const osuDiffAttribs: CacheableDifficultyAttributes<OsuDifficultyAttributes> | null =
            await DPPProcessorRESTManager.getDifficultyAttributes(
                challenge.beatmapid,
                Modes.osu,
                PPCalculationMethod.live,
                calcParams,
            );

        if (!osuDiffAttribs) {
            return null;
        }

        const embedOptions: BaseMessageOptions = this.createCalculationEmbed(
            beatmapInfo,
            calcParams,
            droidDiffAttribs,
            osuDiffAttribs,
            undefined,
            undefined,
            language,
        );

        const embed: EmbedBuilder = EmbedBuilder.from(embedOptions.embeds![0]);

        embed
            .spliceFields(embed.data.fields!.length - 2, 2)
            .setFooter({
                text:
                    embed.data.footer!.text! +
                    ` | ${localization.getTranslation("challengeId")}: ${
                        challenge.challengeid
                    } | ${localization.getTranslation(
                        "timeLeft",
                    )}: ${DateTimeFormatHelper.secondsToDHMS(
                        Math.max(
                            0,
                            DateTimeFormatHelper.getTimeDifference(
                                challenge.timelimit * 1000,
                            ) / 1000,
                        ),
                    )}`,
                iconURL: embed.data.footer!.icon_url,
            })
            .setAuthor({
                name: localization.getTranslation(
                    challenge.type === "weekly"
                        ? "weeklyChallengeTitle"
                        : "dailyChallengeTitle",
                ),
                iconURL: `attachment://osu-${osuDiffAttribs.starRating.toFixed(
                    2,
                )}.png`,
            })
            .setDescription(
                StringHelper.formatString(
                    localization.getTranslation("featuredPerson"),
                    userMention(challenge.featured),
                ),
            )
            .addFields({
                name:
                    `${bold(localization.getTranslation("starRating"))}\n` +
                    `${Symbols.star.repeat(
                        Math.min(10, Math.floor(droidDiffAttribs.starRating)),
                    )} ${droidDiffAttribs.starRating.toFixed(
                        2,
                    )} ${localization.getTranslation("droidStars")}\n` +
                    `${Symbols.star.repeat(
                        Math.min(10, Math.floor(osuDiffAttribs.starRating)),
                    )} ${osuDiffAttribs.starRating.toFixed(
                        2,
                    )} ${localization.getTranslation("pcStars")}`,
                value:
                    `${bold(localization.getTranslation("points"))}: ${
                        challenge.points
                    } ${localization.getTranslation("points")}\n` +
                    `${bold(
                        localization.getTranslation("passCondition"),
                    )}: ${challenge.getPassInformation()}\n` +
                    `${bold(localization.getTranslation("constrain"))}: ${
                        challenge.constrain
                            ? StringHelper.formatString(
                                  localization.getTranslation("modOnly"),
                                  challenge.constrain.toUpperCase(),
                              )
                            : localization.getTranslation("rankableMods")
                    }\n\n` +
                    localization.getTranslation("challengeBonuses"),
            });

        const actionRow: ActionRowBuilder<ButtonBuilder> =
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setURL(challenge.link[0])
                    .setEmoji(Symbols.inboxTray)
                    .setStyle(ButtonStyle.Link)
                    .setLabel("Download"),
            );

        if (challenge.link[1]) {
            actionRow.addComponents(
                new ButtonBuilder()
                    .setURL(challenge.link[1])
                    .setEmoji(Symbols.inboxTray)
                    .setStyle(ButtonStyle.Link)
                    .setLabel("Download (alternative)"),
            );
        }

        return {
            embeds: [embed],
            components: [actionRow],
        };
    }

    /**
     * Creates a clan auction embed.
     *
     * @param auction The auction to create the embed for.
     * @param coinEmoji Alice coin emoji.
     * @param language The locale of the user who attempted to create the embed. Defaults to English.
     * @returns The embed.
     */
    static createClanAuctionEmbed(
        auction: ClanAuction,
        coinEmoji: GuildEmoji,
        language: Language = "en",
    ): EmbedBuilder {
        const localization: EmbedCreatorLocalization =
            this.getLocalization(language);

        const embed: EmbedBuilder = this.createNormalEmbed({
            color: "#cb9000",
        });

        const BCP47: string = LocaleHelper.convertToBCP47(language);

        embed
            .setTitle(localization.getTranslation("auctionInfo"))
            .setDescription(
                `${bold(localization.getTranslation("auctionName"))}: ${
                    auction.name
                }\n` +
                    `${bold(
                        localization.getTranslation("auctionAuctioneer"),
                    )}: ${auction.auctioneer}\n` +
                    `${bold(
                        localization.getTranslation("creationDate"),
                    )}: ${DateTimeFormatHelper.dateToLocaleString(
                        new Date(auction.creationdate * 1000),
                        language,
                    )}\n` +
                    `${bold(
                        localization.getTranslation("auctionMinimumBid"),
                    )}: ${coinEmoji}${auction.min_price} Alice coins`,
            )
            .addFields(
                {
                    name: localization.getTranslation("auctionItemInfo"),
                    value:
                        `${bold(
                            localization.getTranslation("auctionPowerup"),
                        )}: ${StringHelper.capitalizeString(
                            auction.powerup,
                        )}\n` +
                        `${bold(
                            localization.getTranslation("auctionItemAmount"),
                        )}: ${auction.amount.toLocaleString(BCP47)}`,
                },
                {
                    name: localization.getTranslation("auctionBidInfo"),
                    value:
                        `${bold(
                            localization.getTranslation("auctionBidders"),
                        )}: ${auction.bids.size.toLocaleString(BCP47)}\n` +
                        `${bold(
                            localization.getTranslation("auctionTopBidders"),
                        )}:\n` +
                        auction.bids
                            .first(5)
                            .map(
                                (v, i) =>
                                    `#${i + 1}: ${v.clan} - ${coinEmoji}\`${
                                        v.amount
                                    }\` Alice coins`,
                            ),
                },
            );

        return embed;
    }

    /**
     * Creates an embed for report broadcast in a guild.
     *
     * @param guild The guild.
     * @param language The locale of the guild. Defaults to English.
     * @returns The embed.
     */
    static createReportBroadcastEmbed(
        guild: Guild,
        language: Language = "en",
    ): EmbedBuilder {
        const localization: EmbedCreatorLocalization =
            this.getLocalization(language);

        const embed: EmbedBuilder = this.createNormalEmbed({
            color: "#b566ff",
        });

        embed
            .setAuthor({
                name: localization.getTranslation("reportBroadcast"),
                iconURL: guild.iconURL()!,
            })
            .setDescription(
                `${localization.getTranslation(
                    "reportBroadcast1",
                )}\n\n${localization.getTranslation("reportBroadcast2")}`,
            );

        return embed;
    }

    /**
     * Creates an embed summarizing a tournament match.
     *
     * @param match The match.
     * @returns The embed.
     */
    static createMatchSummaryEmbed(match: TournamentMatch): EmbedBuilder {
        const embed: EmbedBuilder = this.createNormalEmbed({
            color: match.matchColorCode,
        });

        embed.setTitle(match.name).addFields(
            {
                name: match.team[0][0],
                value: bold(match.team[0][1].toString()),
                inline: true,
            },
            {
                name: match.team[1][0],
                value: bold(match.team[1][1].toString()),
                inline: true,
            },
        );

        return embed;
    }

    /**
     * Creates an embed for a map share submission.
     *
     * @param submission The submission.
     * @returns The options for the embed.
     */
    static async createMapShareEmbed(
        submission: MapShare,
        language: Language = "en",
    ): Promise<BaseMessageOptions | null> {
        const localization: EmbedCreatorLocalization =
            this.getLocalization(language);

        const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
            submission.beatmap_id,
            { checkFile: false },
        );

        if (!beatmapInfo) {
            return null;
        }

        const calcParams: DifficultyCalculationParameters =
            new DifficultyCalculationParameters();

        const droidDiffAttribs: CacheableDifficultyAttributes<DroidDifficultyAttributes> | null =
            await DPPProcessorRESTManager.getDifficultyAttributes(
                submission.beatmap_id,
                Modes.droid,
                PPCalculationMethod.live,
                calcParams,
            );

        const osuDiffAttribs: CacheableDifficultyAttributes<OsuDifficultyAttributes> | null =
            await DPPProcessorRESTManager.getDifficultyAttributes(
                submission.beatmap_id,
                Modes.osu,
                PPCalculationMethod.live,
                calcParams,
            );

        if (!droidDiffAttribs || !osuDiffAttribs) {
            return null;
        }

        const embedOptions: BaseMessageOptions = this.createCalculationEmbed(
            beatmapInfo,
            calcParams,
            droidDiffAttribs,
            osuDiffAttribs,
            undefined,
            undefined,
            language,
        );

        const embed: EmbedBuilder = EmbedBuilder.from(embedOptions.embeds![0]);

        embed
            .setImage("attachment://chart.png")
            .setAuthor({
                name: StringHelper.formatString(
                    localization.getTranslation("mapShareSubmission"),
                    submission.submitter,
                ),
                iconURL: `attachment://osu-${osuDiffAttribs.starRating.toFixed(
                    2,
                )}.png`,
            })
            .addFields(
                {
                    name: bold(localization.getTranslation("starRating")),
                    value:
                        `${Symbols.star.repeat(
                            Math.min(
                                10,
                                Math.floor(droidDiffAttribs.starRating),
                            ),
                        )} ${droidDiffAttribs.starRating.toFixed(
                            2,
                        )} ${localization.getTranslation("droidStars")}\n` +
                        `${Symbols.star.repeat(
                            Math.min(10, Math.floor(osuDiffAttribs.starRating)),
                        )} ${osuDiffAttribs.starRating.toFixed(
                            2,
                        )} ${localization.getTranslation("pcStars")}`,
                },
                {
                    name: bold(
                        localization.getTranslation("mapShareStatusAndSummary"),
                    ),
                    value:
                        `${bold(
                            localization.getTranslation("mapShareStatus"),
                        )}: ${StringHelper.capitalizeString(
                            localization.getTranslation(
                                <keyof EmbedCreatorStrings>(
                                    `mapShareStatus${StringHelper.capitalizeString(
                                        submission.status,
                                    )}`
                                ),
                            ),
                        )}\n\n` +
                        `${bold(
                            localization.getTranslation("mapShareSummary"),
                        )}:\n${submission.summary}`,
                },
            );

        return embedOptions;
    }

    /**
     * Gets an embed representing a music queue.
     *
     * @param queue The music queue.
     * @param language The locale of the user who attempted to create this embed. Defaults to English.
     * @returns The embed.
     */
    static createMusicQueueEmbed(
        queue: MusicQueue,
        language: Language = "en",
    ): EmbedBuilder {
        const localization: EmbedCreatorLocalization =
            this.getLocalization(language);

        const embed: EmbedBuilder = this.createNormalEmbed();

        embed
            .setTitle(queue.information.title)
            .setThumbnail(queue.information.thumbnail ?? null)
            .setDescription(
                `${localization.getTranslation("musicYoutubeChannel")}: ${
                    queue.information.author.name
                }\n\n${localization.getTranslation(
                    "musicDuration",
                )}: ${queue.information.duration.toString()}\n\n${StringHelper.formatString(
                    localization.getTranslation("musicQueuer"),
                    userMention(queue.queuer),
                )}`,
            )
            .setURL(queue.information.url);

        return embed;
    }

    /**
     * Gets an embed representing a user's warning.
     *
     * @param warning The warning.
     * @param language The locale of the user who attempted to create this embed. Defaults to English.
     */
    static createWarningEmbed(
        warning: Warning,
        language: Language = "en",
    ): EmbedBuilder {
        const localization: EmbedCreatorLocalization =
            this.getLocalization(language);

        const embed: EmbedBuilder = this.createNormalEmbed({
            color: "Blurple",
            footerText: `${localization.getTranslation("warningId")}: ${
                warning.guildSpecificId
            }`,
        });

        embed
            .setTitle(localization.getTranslation("warningInfo"))
            .setDescription(
                `${bold(
                    StringHelper.formatString(
                        localization.getTranslation("warningIssuedBy"),
                        warning.issuerId,
                        warning.issuerId,
                    ),
                )}\n\n` +
                    `${bold(
                        localization.getTranslation("warnedUser"),
                    )}: ${userMention(warning.discordId)} (${
                        warning.discordId
                    })\n` +
                    `${bold(
                        localization.getTranslation("channel"),
                    )}: ${channelMention(warning.channelId)} (${
                        warning.channelId
                    })\n` +
                    `${bold(
                        localization.getTranslation("creationDate"),
                    )}: ${DateTimeFormatHelper.dateToLocaleString(
                        new Date(warning.creationDate * 1000),
                        language,
                    )}\n` +
                    `${bold(
                        localization.getTranslation("expirationDate"),
                    )}: ${DateTimeFormatHelper.dateToLocaleString(
                        new Date(warning.expirationDate * 1000),
                        language,
                    )}\n\n` +
                    `${bold(localization.getTranslation("reason"))}:\n${
                        warning.reason
                    }`,
            );

        return embed;
    }

    /**
     * Gets the localization for this creator utility.
     *
     * @param language The language to localize.
     */
    private static getLocalization(
        language: Language,
    ): EmbedCreatorLocalization {
        return new EmbedCreatorLocalization(language);
    }
}
