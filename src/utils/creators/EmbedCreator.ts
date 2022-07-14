import {
    BaseCommandInteraction,
    ColorResolvable,
    Guild,
    GuildEmoji,
    GuildMember,
    MessageActionRow,
    MessageAttachment,
    MessageButton,
    MessageComponentInteraction,
    MessageEmbed,
    MessageOptions,
    User,
} from "discord.js";
import { Config } from "@alice-core/Config";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { Symbols } from "@alice-enums/utils/Symbols";
import { Challenge } from "@alice-database/utils/aliceDb/Challenge";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { DifficultyCalculationResult } from "@alice-utils/dpp/DifficultyCalculationResult";
import { ClanAuction } from "@alice-database/utils/aliceDb/ClanAuction";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TournamentMatch } from "@alice-database/utils/elainaDb/TournamentMatch";
import { DifficultyCalculationParameters } from "@alice-utils/dpp/DifficultyCalculationParameters";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import { ScoreRank } from "@alice-types/utils/ScoreRank";
import { MapShare } from "@alice-database/utils/aliceDb/MapShare";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { MusicQueue } from "@alice-utils/music/MusicQueue";
import { RebalanceDifficultyCalculationResult } from "@alice-utils/dpp/RebalanceDifficultyCalculationResult";
import { RebalancePerformanceCalculationResult } from "@alice-utils/dpp/RebalancePerformanceCalculationResult";
import { DroidBeatmapDifficultyHelper } from "@alice-utils/helpers/DroidBeatmapDifficultyHelper";
import { OsuBeatmapDifficultyHelper } from "@alice-utils/helpers/OsuBeatmapDifficultyHelper";
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
} from "@rian8337/osu-base";
import {
    DroidDifficultyCalculator,
    DroidPerformanceCalculator,
    OsuDifficultyCalculator,
    OsuPerformanceCalculator,
} from "@rian8337/osu-difficulty-calculator";
import {
    DroidDifficultyCalculator as RebalanceDroidDifficultyCalculator,
    DroidPerformanceCalculator as RebalanceDroidPerformanceCalculator,
    OsuDifficultyCalculator as RebalanceOsuDifficultyCalculator,
    OsuPerformanceCalculator as RebalanceOsuPerformanceCalculator,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import {
    ReplayData,
    ReplayObjectData,
    hitResult,
    HitErrorInformation,
} from "@rian8337/osu-droid-replay-analyzer";
import { Score } from "@rian8337/osu-droid-utilities";
import getStrainChart from "@rian8337/osu-strain-graph-generator";
import { Language } from "@alice-localization/base/Language";
import {
    EmbedCreatorLocalization,
    EmbedCreatorStrings,
} from "@alice-localization/utils/creators/EmbedCreator/EmbedCreatorLocalization";
import { Warning } from "@alice-database/utils/aliceDb/Warning";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { MessageButtonStyles } from "discord.js/typings/enums";
import { OldPerformanceCalculationResult } from "@alice-utils/dpp/OldPerformanceCalculationResult";
import { OldDifficultyCalculationResult } from "@alice-utils/dpp/OldDifficultyCalculationResult";
import { std_ppv2 } from "ojsamadroid";

/**
 * Utility to create message embeds.
 */
export abstract class EmbedCreator {
    private static readonly botSign: string = "Alice Synthesis Thirty";
    private static readonly droidDiffCalcHelper: DroidBeatmapDifficultyHelper =
        new DroidBeatmapDifficultyHelper();
    private static readonly osuDiffCalcHelper: OsuBeatmapDifficultyHelper =
        new OsuBeatmapDifficultyHelper();

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
        } = {}
    ): MessageEmbed {
        const iconURL: string = ArrayHelper.getRandomArrayElement(
            Config.avatarList
        );
        const embed: MessageEmbed = new MessageEmbed().setFooter({
            text: this.botSign,
            iconURL: iconURL,
        });

        if (embedOptions.author) {
            embed.setAuthor({
                name: embedOptions.author.tag,
                iconURL: embedOptions.author.avatarURL({ dynamic: true })!,
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
        language: Language = "en"
    ): MessageOptions {
        const localization: EmbedCreatorLocalization =
            new EmbedCreatorLocalization(language);

        const embed: MessageEmbed = this.createNormalEmbed({
            color: <ColorResolvable>(
                BeatmapManager.getBeatmapDifficultyColor(
                    parseFloat(beatmapInfo.totalDifficulty.toFixed(2))
                )
            ),
        });

        return {
            embeds: [
                embed
                    .setAuthor({
                        name: localization.getTranslation("beatmapInfo"),
                        iconURL: `attachment://osu-${beatmapInfo.totalDifficulty.toFixed(
                            2
                        )}.png`,
                    })
                    .setThumbnail(
                        `https://b.ppy.sh/thumb/${beatmapInfo.beatmapsetID}l.jpg`
                    )
                    .setTitle(
                        beatmapInfo.showStatistics(
                            0,
                            calculationParams?.customStatistics
                        )
                    )
                    .setDescription(
                        beatmapInfo.showStatistics(
                            1,
                            calculationParams?.customStatistics
                        ) +
                            "\n" +
                            beatmapInfo.showStatistics(
                                2,
                                calculationParams?.customStatistics
                            )
                    )
                    .setURL(`https://osu.ppy.sh/b/${beatmapInfo.beatmapID}`)
                    .addField(
                        `**${localization.getTranslation(
                            "beatmapDroidStatistics"
                        )}**`,
                        beatmapInfo.showStatistics(
                            3,
                            calculationParams?.customStatistics
                        )
                    )
                    .addField(
                        `**${localization.getTranslation(
                            "beatmapOsuStatistics"
                        )}**`,
                        beatmapInfo.showStatistics(
                            4,
                            calculationParams?.customStatistics
                        )
                    )
                    .addField(
                        `**${localization.getTranslation(
                            "beatmapGeneralStatistics"
                        )}**`,
                        beatmapInfo.showStatistics(
                            5,
                            calculationParams?.customStatistics
                        )
                    )
                    .addField(
                        beatmapInfo.showStatistics(
                            6,
                            calculationParams?.customStatistics
                        ),
                        beatmapInfo.showStatistics(
                            7,
                            calculationParams?.customStatistics
                        )
                    )
                    .addField(
                        localization.getTranslation("starRating"),
                        `${Symbols.star.repeat(
                            Math.floor(beatmapInfo.totalDifficulty)
                        )} **${beatmapInfo.totalDifficulty.toFixed(
                            2
                        )} ${localization.getTranslation("pcStars")}**`
                    ),
            ],
            files: [
                BeatmapManager.getBeatmapDifficultyIconAttachment(
                    parseFloat(beatmapInfo.totalDifficulty.toFixed(2))
                ),
            ],
        };
    }

    /**
     * Creates an embed for displaying DPP list.
     *
     * @param interaction The interaction that triggered the embed creation.
     * @param bindInfo The bind information of the player.
     * @param ppRank The DPP rank of the player.
     * @param language The locale of the user who attempted to create the embed. Defaults to English.
     * @returns The embed.
     */
    static async createDPPListEmbed(
        interaction: BaseCommandInteraction,
        bindInfo: UserBind,
        ppRank?: number,
        language: Language = "en"
    ): Promise<MessageEmbed> {
        const localization: EmbedCreatorLocalization =
            new EmbedCreatorLocalization(language);

        const embed: MessageEmbed = this.createNormalEmbed({
            author: interaction.user,
            color: (<GuildMember | null>interaction.member)?.displayColor,
        });

        ppRank ??=
            await DatabaseManager.elainaDb.collections.userBind.getUserDPPRank(
                bindInfo.pptotal
            );

        embed.setDescription(
            `**${StringHelper.formatString(
                localization.getTranslation("ppProfileTitle"),
                `<@${bindInfo.discordid}> (${bindInfo.username})`
            )}**\n` +
                `${localization.getTranslation(
                    "totalPP"
                )}: **${bindInfo.pptotal.toFixed(
                    2
                )} pp (#${ppRank.toLocaleString(
                    LocaleHelper.convertToBCP47(language)
                )})**\n` +
                `${localization.getTranslation("recommendedStarRating")}: **${(
                    Math.pow(bindInfo.pptotal, 0.4) * 0.225
                ).toFixed(2)}${Symbols.star}**\n` +
                `[${localization.getTranslation(
                    "ppProfile"
                )}](https://droidppboard.herokuapp.com/profile/${bindInfo.uid})`
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
        interaction: BaseCommandInteraction | MessageComponentInteraction,
        title: string,
        description: string,
        language: Language = "en"
    ): MessageEmbed {
        const embed: MessageEmbed = this.createNormalEmbed({
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
     * @param calculationParams The parameters of the calculation. If `PerformanceCalculationParameters` is specified and `droidCalculationResult` and `osuCalculationResult` is specified as a `PerformanceCalculationResult`, the beatmap's performance values will be shown.
     * @param droidCalculationResult The osu!droid calculation result. If a `PerformanceCalculationResult` is specified and `calculationParams` is specified as `PerformanceCalculationParameters`, the beatmap's performance values will be shown.
     * @param osuCalculationResult The osu!standard calculation result. If a `PerformanceCalculationResult` is specified and `calculationParams` is specified as `PerformanceCalculationParameters`, the beatmap's performance values will be shown.
     * @param graphColor The color of the strain graph.
     * @param language The locale of the user who attempted to create the embed. Defaults to English.
     * @returns The message options that contains the embed.
     */
    static async createCalculationEmbed(
        calculationParams: DifficultyCalculationParameters,
        droidCalculationResult:
            | OldDifficultyCalculationResult
            | DifficultyCalculationResult<DroidDifficultyCalculator>
            | OldPerformanceCalculationResult
            | PerformanceCalculationResult<
                  DroidDifficultyCalculator,
                  DroidPerformanceCalculator
              >
            | RebalanceDifficultyCalculationResult<RebalanceDroidDifficultyCalculator>
            | RebalancePerformanceCalculationResult<
                  RebalanceDroidDifficultyCalculator,
                  RebalanceDroidPerformanceCalculator
              >,
        osuCalculationResult:
            | DifficultyCalculationResult<OsuDifficultyCalculator>
            | PerformanceCalculationResult<
                  OsuDifficultyCalculator,
                  OsuPerformanceCalculator
              >
            | RebalanceDifficultyCalculationResult<RebalanceOsuDifficultyCalculator>
            | RebalancePerformanceCalculationResult<
                  RebalanceOsuDifficultyCalculator,
                  RebalanceOsuPerformanceCalculator
              >,
        graphColor?: string,
        language: Language = "en"
    ): Promise<MessageOptions> {
        const localization: EmbedCreatorLocalization =
            this.getLocalization(language);

        const embedOptions: MessageOptions = this.createBeatmapEmbed(
            osuCalculationResult.map,
            calculationParams,
            language
        );

        const embed: MessageEmbed = <MessageEmbed>embedOptions.embeds![0];
        const map: MapInfo = osuCalculationResult.map;
        const files: NonNullable<MessageOptions["files"]> = embedOptions.files!;

        if (
            calculationParams instanceof PerformanceCalculationParameters &&
            (droidCalculationResult instanceof PerformanceCalculationResult ||
                droidCalculationResult instanceof
                    RebalancePerformanceCalculationResult ||
                droidCalculationResult instanceof
                    OldPerformanceCalculationResult) &&
            (osuCalculationResult instanceof PerformanceCalculationResult ||
                osuCalculationResult instanceof
                    RebalancePerformanceCalculationResult)
        ) {
            const droidPP:
                | DroidPerformanceCalculator
                | RebalanceDroidPerformanceCalculator
                | std_ppv2 = droidCalculationResult.result;
            const pcPP:
                | OsuPerformanceCalculator
                | RebalanceOsuPerformanceCalculator =
                osuCalculationResult.result;

            const combo: number = calculationParams.combo ?? map.maxCombo;
            const accuracy: Accuracy = calculationParams.accuracy;
            const customStatistics: MapStats | undefined =
                calculationParams.customStatistics;

            embed
                .setColor(
                    <ColorResolvable>(
                        BeatmapManager.getBeatmapDifficultyColor(
                            pcPP.difficultyCalculator.total
                        )
                    )
                )
                .spliceFields(embed.fields.length - 2, 2)
                .addField(
                    map.showStatistics(6, customStatistics),
                    `${map.showStatistics(
                        7,
                        customStatistics
                    )}\n**${localization.getTranslation(
                        "result"
                    )}**: ${combo}/${map.maxCombo}x | ${(
                        accuracy.value() * 100
                    ).toFixed(2)}% | [${accuracy.n300}/${accuracy.n100}/${
                        accuracy.n50
                    }/${accuracy.nmiss}]`
                )
                .addField(
                    `**${localization.getTranslation(
                        "droidPP"
                    )}**: __${droidPP.total.toFixed(2)} pp__${
                        calculationParams.isEstimated
                            ? ` (${localization.getTranslation("estimated")})`
                            : ""
                    } - ${
                        droidCalculationResult instanceof
                        OldPerformanceCalculationResult
                            ? droidCalculationResult.difficultyCalculationResult.total.toFixed(
                                  2
                              )
                            : droidCalculationResult.result.difficultyCalculator.total.toFixed(
                                  2
                              )
                    }${Symbols.star}`,
                    `**${localization.getTranslation(
                        "pcPP"
                    )}**: ${pcPP.total.toFixed(2)} pp${
                        calculationParams.isEstimated
                            ? ` (${localization.getTranslation("estimated")})`
                            : ""
                    } - ${pcPP.difficultyCalculator.total.toFixed(2)}${
                        Symbols.star
                    }`
                );
        } else {
            embed
                .setColor(
                    <ColorResolvable>(
                        BeatmapManager.getBeatmapDifficultyColor(
                            droidCalculationResult.result.total
                        )
                    )
                )
                .addField(
                    `**${localization.getTranslation("starRating")}**`,
                    `${Symbols.star.repeat(
                        Math.min(
                            10,
                            Math.floor(droidCalculationResult.result.total)
                        )
                    )} ${droidCalculationResult.result.total.toFixed(
                        2
                    )} ${localization.getTranslation("droidStars")}\n` +
                        `${Symbols.star.repeat(
                            Math.min(
                                10,
                                Math.floor(osuCalculationResult.result.total)
                            )
                        )} ${osuCalculationResult.result.total.toFixed(
                            2
                        )} ${localization.getTranslation("pcStars")}`
                );
        }

        if (
            droidCalculationResult instanceof
                RebalancePerformanceCalculationResult &&
            osuCalculationResult instanceof
                RebalancePerformanceCalculationResult
        ) {
            embed.setDescription(
                `**${localization.getTranslation(
                    "rebalanceCalculationNote"
                )}**\n` + embed.description
            );
        }

        if (droidCalculationResult instanceof OldPerformanceCalculationResult) {
            embed.setDescription(
                `**${localization.getTranslation("oldCalculationNote")}**\n` +
                    embed.description
            );
        }

        const newRating:
            | OsuDifficultyCalculator
            | RebalanceOsuDifficultyCalculator =
            osuCalculationResult instanceof PerformanceCalculationResult ||
            osuCalculationResult instanceof
                RebalancePerformanceCalculationResult
                ? osuCalculationResult.result.difficultyCalculator
                : osuCalculationResult.result;

        if (
            !Precision.almostEqualsNumber(
                osuCalculationResult.map.totalDifficulty,
                newRating.total
            )
        ) {
            // Recreate difficulty icon if difficulty is different.
            files.length = 0;

            files.push(
                BeatmapManager.getBeatmapDifficultyIconAttachment(
                    parseFloat(newRating.total.toFixed(2))
                )
            );

            embed.setAuthor({
                name: localization.getTranslation("beatmapInfo"),
                iconURL: `attachment://osu-${newRating.total.toFixed(2)}.png`,
            });
        }

        const chart: Buffer | null = await getStrainChart(
            newRating,
            map.beatmapsetID,
            graphColor
        );

        if (chart) {
            embed.setImage("attachment://chart.png");

            files.push(new MessageAttachment(chart, "chart.png"));
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
     * @param language The locale of the user who requested the recent play embed. Defaults to English.
     * @returns The embed.
     */
    static async createRecentPlayEmbed(
        score: Score,
        playerAvatarURL: string,
        embedColor?: ColorResolvable,
        language: Language = "en"
    ): Promise<MessageEmbed> {
        const localization: EmbedCreatorLocalization =
            this.getLocalization(language);

        const BCP47: string = LocaleHelper.convertToBCP47(language);

        const arrow: Symbols = Symbols.rightArrowSmall;

        const embed: MessageEmbed = this.createNormalEmbed({
            color: embedColor,
            footerText: StringHelper.formatString(
                localization.getTranslation("dateAchieved"),
                DateTimeFormatHelper.dateToLocaleString(score.date, language)
            ),
        });

        embed.setAuthor({
            name: `${score.title} ${score.getCompleteModString()}`,
            iconURL: playerAvatarURL,
        });

        const droidCalcResult: PerformanceCalculationResult<
            DroidDifficultyCalculator,
            DroidPerformanceCalculator
        > | null = await this.droidDiffCalcHelper.calculateScorePerformance(
            score
        );

        const osuCalcResult: PerformanceCalculationResult<
            OsuDifficultyCalculator,
            OsuPerformanceCalculator
        > | null = await this.osuDiffCalcHelper.calculateScorePerformance(
            score
        );

        let beatmapInformation: string = `${arrow} **${BeatmapManager.getRankEmote(
            <ScoreRank>score.rank
        )}** ${arrow} `;

        if (!droidCalcResult || !osuCalcResult) {
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

        embed
            .setAuthor({
                name: `${
                    osuCalcResult.map.fullTitle
                } ${score.getCompleteModString()} [${droidCalcResult.result.difficultyCalculator.total.toFixed(
                    2
                )}${
                    Symbols.star
                } | ${osuCalcResult.result.difficultyCalculator.total.toFixed(
                    2
                )}${Symbols.star}]`,
                iconURL: playerAvatarURL,
                url: `https://osu.ppy.sh/b/${osuCalcResult.map.beatmapID}`,
            })
            .setThumbnail(
                `https://b.ppy.sh/thumb/${osuCalcResult.map.beatmapsetID}l.jpg`
            );

        beatmapInformation += `**${droidCalcResult.result.total.toFixed(
            2
        )}DPP**${
            (droidCalcResult.replay?.tapPenalty ?? 1) !== 1
                ? ` (*${localization.getTranslation("penalized")}*)`
                : ""
        } | **${osuCalcResult.result.total.toFixed(2)}PP** `;

        if (
            score.accuracy.nmiss > 0 ||
            score.combo < osuCalcResult.map.maxCombo
        ) {
            const calcParams: PerformanceCalculationParameters =
                await BeatmapDifficultyHelper.getCalculationParamsFromScore(
                    score
                );

            calcParams.combo = osuCalcResult.map.maxCombo;
            calcParams.accuracy = new Accuracy({
                n300: score.accuracy.n300 + score.accuracy.nmiss,
                n100: score.accuracy.n100,
                n50: score.accuracy.n50,
                nmiss: 0,
            });

            // Safe to non-null since previous calculation works.
            const droidFcCalcResult: PerformanceCalculationResult<
                DroidDifficultyCalculator,
                DroidPerformanceCalculator
            > = (await this.droidDiffCalcHelper.calculateBeatmapPerformance(
                new DifficultyCalculationResult(
                    droidCalcResult.map,
                    droidCalcResult.result.difficultyCalculator
                ),
                calcParams
            ))!;

            // Safe to non-null since previous calculation works.
            const osuFcCalcResult: PerformanceCalculationResult<
                OsuDifficultyCalculator,
                OsuPerformanceCalculator
            > = (await this.osuDiffCalcHelper.calculateBeatmapPerformance(
                new DifficultyCalculationResult(
                    osuCalcResult.map,
                    osuCalcResult.result.difficultyCalculator
                ),
                calcParams
            ))!;

            beatmapInformation += `(${droidFcCalcResult.result.total.toFixed(
                2
            )}DPP, ${osuFcCalcResult.result.total.toFixed(
                2
            )}PP ${StringHelper.formatString(
                localization.getTranslation("forFC"),
                (calcParams.accuracy.value() * 100).toFixed(2) + "%"
            )}) `;
        }

        beatmapInformation +=
            `${arrow} ${(score.accuracy.value() * 100).toFixed(2)}%\n` +
            `${arrow} ${score.score.toLocaleString(BCP47)} ${arrow} ${
                score.combo
            }x/${osuCalcResult.map.maxCombo}x ${arrow} [${
                score.accuracy.n300
            }/${score.accuracy.n100}/${score.accuracy.n50}/${
                score.accuracy.nmiss
            }]`;

        if (!score.replay) {
            await score.downloadReplay();
        }

        const replayData: ReplayData | undefined | null = score.replay?.data;

        if (replayData) {
            const { difficultyCalculator } = droidCalcResult.result;

            score.replay!.beatmap ??= difficultyCalculator;

            // Get amount of slider ticks and ends hit
            let collectedSliderTicks: number = 0;
            let collectedSliderEnds: number = 0;

            for (let i = 0; i < replayData.hitObjectData.length; ++i) {
                // Using droid star rating as legacy slider tail doesn't exist.
                const object: HitObject =
                    difficultyCalculator.beatmap.hitObjects.objects[i];
                const objectData: ReplayObjectData =
                    replayData.hitObjectData[i];

                if (
                    objectData.result === hitResult.RESULT_0 ||
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
                difficultyCalculator.beatmap.hitObjects.sliderTicks
            } ${localization.getTranslation(
                "sliderTicks"
            )} ${arrow} ${collectedSliderEnds}/${
                difficultyCalculator.beatmap.hitObjects.sliderEnds
            } ${localization.getTranslation("sliderEnds")}`;

            // Get hit error average and UR
            const hitErrorInformation: HitErrorInformation =
                score.replay!.calculateHitError()!;

            beatmapInformation += `\n${arrow} ${hitErrorInformation.negativeAvg.toFixed(
                2
            )}ms - ${hitErrorInformation.positiveAvg.toFixed(
                2
            )}ms ${localization.getTranslation(
                "hitErrorAvg"
            )} ${arrow} ${hitErrorInformation.unstableRate.toFixed(2)} UR`;
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
        language: Language = "en"
    ): Promise<MessageOptions> {
        const localization: EmbedCreatorLocalization =
            this.getLocalization(language);

        const calcParams: DifficultyCalculationParameters =
            new DifficultyCalculationParameters(
                new MapStats({
                    mods: ModUtil.pcStringToMods(challenge.constrain),
                })
            );

        const droidCalcResult: DifficultyCalculationResult<DroidDifficultyCalculator> =
            (await this.droidDiffCalcHelper.calculateBeatmapDifficulty(
                challenge.beatmapid,
                calcParams
            ))!;

        const osuCalcResult: DifficultyCalculationResult<OsuDifficultyCalculator> =
            (await this.osuDiffCalcHelper.calculateBeatmapDifficulty(
                challenge.beatmapid,
                calcParams
            ))!;

        const embedOptions: MessageOptions = await this.createCalculationEmbed(
            calcParams,
            droidCalcResult,
            osuCalcResult,
            undefined,
            language
        );

        const embed: MessageEmbed = <MessageEmbed>embedOptions.embeds![0];

        embed
            .spliceFields(embed.fields.length - 2, 2)
            .setFooter({
                text:
                    embed.footer!.text! +
                    ` | ${localization.getTranslation("challengeId")}: ${
                        challenge.challengeid
                    } | ${localization.getTranslation(
                        "timeLeft"
                    )}: ${DateTimeFormatHelper.secondsToDHMS(
                        Math.max(
                            0,
                            DateTimeFormatHelper.getTimeDifference(
                                challenge.timelimit * 1000
                            ) / 1000
                        )
                    )}`,
                iconURL: embed.footer!.iconURL,
            })
            .setAuthor({
                name: localization.getTranslation(
                    challenge.type === "weekly"
                        ? "weeklyChallengeTitle"
                        : "dailyChallengeTitle"
                ),
                iconURL: `attachment://osu-${osuCalcResult.result.total.toFixed(
                    2
                )}.png`,
            })
            .setDescription(
                StringHelper.formatString(
                    localization.getTranslation("featuredPerson"),
                    `<@${challenge.featured}>`
                )
            )
            .addField(
                `**${localization.getTranslation("starRating")}**\n` +
                    `${Symbols.star.repeat(
                        Math.min(10, Math.floor(droidCalcResult.result.total))
                    )} ${droidCalcResult.result.total.toFixed(
                        2
                    )} ${localization.getTranslation("droidStars")}\n` +
                    `${Symbols.star.repeat(
                        Math.min(10, Math.floor(osuCalcResult.result.total))
                    )} ${osuCalcResult.result.total.toFixed(
                        2
                    )} ${localization.getTranslation("pcStars")}`,
                `**${localization.getTranslation("points")}**: ${
                    challenge.points
                } ${localization.getTranslation("points")}\n` +
                    `**${localization.getTranslation(
                        "passCondition"
                    )}**: ${challenge.getPassInformation()}\n` +
                    `**${localization.getTranslation("constrain")}**: ${
                        challenge.constrain
                            ? StringHelper.formatString(
                                  localization.getTranslation("modOnly"),
                                  challenge.constrain.toUpperCase()
                              )
                            : localization.getTranslation("rankableMods")
                    }\n\n` +
                    localization.getTranslation("challengeBonuses")
            );

        const chart: Buffer | null = await getStrainChart(
            osuCalcResult.result,
            osuCalcResult.map.beatmapsetID,
            graphColor
        );

        const files: NonNullable<MessageOptions["files"]> = embedOptions.files!;

        if (chart) {
            embed.setImage("attachment://chart.png");

            files.push(new MessageAttachment(chart, "chart.png"));
        }

        const actionRow: MessageActionRow =
            new MessageActionRow().addComponents(
                new MessageButton()
                    .setURL(challenge.link[0])
                    .setEmoji(Symbols.inboxTray)
                    .setStyle(MessageButtonStyles.LINK)
                    .setLabel("Download")
            );

        if (challenge.link[1]) {
            actionRow.addComponents(
                new MessageButton()
                    .setURL(challenge.link[1])
                    .setEmoji(Symbols.inboxTray)
                    .setStyle(MessageButtonStyles.LINK)
                    .setLabel("Download (alternative)")
            );
        }

        return {
            embeds: [embed],
            files: files,
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
        language: Language = "en"
    ): MessageEmbed {
        const localization: EmbedCreatorLocalization =
            this.getLocalization(language);

        const embed: MessageEmbed = this.createNormalEmbed({
            color: "#cb9000",
        });

        const BCP47: string = LocaleHelper.convertToBCP47(language);

        embed
            .setTitle(localization.getTranslation("auctionInfo"))
            .setDescription(
                `**${localization.getTranslation("auctionName")}**: ${
                    auction.name
                }\n` +
                    `**${localization.getTranslation("auctionAuctioneer")}**: ${
                        auction.auctioneer
                    }\n` +
                    `**${localization.getTranslation(
                        "creationDate"
                    )}**: ${DateTimeFormatHelper.dateToLocaleString(
                        new Date(auction.creationdate * 1000),
                        language
                    )}\n` +
                    `**${localization.getTranslation(
                        "auctionMinimumBid"
                    )}**: ${coinEmoji}${auction.min_price} Alice coins`
            )
            .addField(
                localization.getTranslation("auctionItemInfo"),
                `**${localization.getTranslation(
                    "auctionPowerup"
                )}**: ${StringHelper.capitalizeString(auction.powerup)}\n` +
                    `**${localization.getTranslation(
                        "auctionItemAmount"
                    )}**: ${auction.amount.toLocaleString(BCP47)}`
            )
            .addField(
                localization.getTranslation("auctionBidInfo"),
                `**${localization.getTranslation(
                    "auctionBidders"
                )}**: ${auction.bids.size.toLocaleString(BCP47)}\n` +
                    `**${localization.getTranslation(
                        "auctionTopBidders"
                    )}**:\n` +
                    auction.bids
                        .first(5)
                        .map(
                            (v, i) =>
                                `#${i + 1}: ${v.clan} - ${coinEmoji}\`${
                                    v.amount
                                }\` Alice coins`
                        )
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
        language: Language = "en"
    ): MessageEmbed {
        const localization: EmbedCreatorLocalization =
            this.getLocalization(language);

        const embed: MessageEmbed = this.createNormalEmbed({
            color: "#b566ff",
        });

        embed
            .setAuthor({
                name: localization.getTranslation("broadcast"),
                iconURL: guild.iconURL({ dynamic: true })!,
            })
            .setDescription(
                `${localization.getTranslation(
                    "broadcast1"
                )}\n\n${localization.getTranslation("broadcast2")}`
            );

        return embed;
    }

    /**
     * Creates an embed summarizing a tournament match.
     *
     * @param match The match.
     * @returns The embed.
     */
    static createMatchSummaryEmbed(match: TournamentMatch): MessageEmbed {
        const embed: MessageEmbed = this.createNormalEmbed({
            color: match.matchColorCode,
        });

        embed
            .setTitle(match.name)
            .addField(match.team[0][0], `**${match.team[0][1]}**`, true)
            .addField(match.team[1][0], `**${match.team[1][1]}**`, true);

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
        language: Language = "en"
    ): Promise<MessageOptions> {
        const localization: EmbedCreatorLocalization =
            this.getLocalization(language);

        const calcParams: DifficultyCalculationParameters =
            new DifficultyCalculationParameters();

        const droidCalcResult: DifficultyCalculationResult<DroidDifficultyCalculator> =
            (await this.droidDiffCalcHelper.calculateBeatmapDifficulty(
                submission.beatmap_id,
                calcParams
            ))!;

        const osuCalcResult: DifficultyCalculationResult<OsuDifficultyCalculator> =
            (await this.osuDiffCalcHelper.calculateBeatmapDifficulty(
                submission.beatmap_id,
                calcParams
            ))!;

        const embedOptions: MessageOptions = await this.createCalculationEmbed(
            calcParams,
            droidCalcResult,
            osuCalcResult,
            "#28ebda",
            language
        );

        const embed: MessageEmbed = <MessageEmbed>embedOptions.embeds![0];

        embed
            .setImage("attachment://chart.png")
            .setAuthor({
                name: StringHelper.formatString(
                    localization.getTranslation("mapShareSubmission"),
                    submission.submitter
                ),
                iconURL: `attachment://osu-${osuCalcResult.result.total.toFixed(
                    2
                )}.png`,
            })
            .addField(
                `**${localization.getTranslation("starRating")}**`,
                `${Symbols.star.repeat(
                    Math.min(10, Math.floor(droidCalcResult.result.total))
                )} ${droidCalcResult.result.total.toFixed(
                    2
                )} ${localization.getTranslation("droidStars")}\n` +
                    `${Symbols.star.repeat(
                        Math.min(10, Math.floor(osuCalcResult.result.total))
                    )} ${osuCalcResult.result.total.toFixed(
                        2
                    )} ${localization.getTranslation("pcStars")}`
            )
            .addField(
                `**${localization.getTranslation(
                    "mapShareStatusAndSummary"
                )}**`,
                `**${localization.getTranslation(
                    "mapShareStatus"
                )}**: ${StringHelper.capitalizeString(
                    localization.getTranslation(
                        <keyof EmbedCreatorStrings>(
                            `mapShareStatus${StringHelper.capitalizeString(
                                submission.status
                            )}`
                        )
                    )
                )}\n\n` +
                    `**${localization.getTranslation("mapShareSummary")}**:\n${
                        submission.summary
                    }`
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
        language: Language = "en"
    ): MessageEmbed {
        const localization: EmbedCreatorLocalization =
            this.getLocalization(language);

        const embed: MessageEmbed = this.createNormalEmbed();

        embed
            .setTitle(queue.information.title)
            .setThumbnail(queue.information.thumbnail)
            .setDescription(
                `${localization.getTranslation("musicYoutubeChannel")}: ${
                    queue.information.author.name
                }\n\n${localization.getTranslation(
                    "musicDuration"
                )}: ${queue.information.duration.toString()}\n\n${StringHelper.formatString(
                    localization.getTranslation("musicQueuer"),
                    `<@${queue.queuer}>`
                )}`
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
        language: Language = "en"
    ): MessageEmbed {
        const localization: EmbedCreatorLocalization =
            this.getLocalization(language);

        const embed: MessageEmbed = this.createNormalEmbed({
            color: "BLURPLE",
            footerText: `${localization.getTranslation("warningId")}: ${
                warning.guildSpecificId
            }`,
        });

        embed
            .setTitle(localization.getTranslation("warningInfo"))
            .setDescription(
                `**${StringHelper.formatString(
                    localization.getTranslation("warningIssuedBy"),
                    warning.issuerId,
                    warning.issuerId
                )}**\n\n` +
                    `**${localization.getTranslation("warnedUser")}**: <@${
                        warning.discordId
                    }> (${warning.discordId})\n` +
                    `**${localization.getTranslation("channel")}**: <#${
                        warning.channelId
                    }> (${warning.channelId})\n` +
                    `**${localization.getTranslation(
                        "creationDate"
                    )}**: ${DateTimeFormatHelper.dateToLocaleString(
                        new Date(warning.creationDate * 1000),
                        language
                    )}\n` +
                    `**${localization.getTranslation(
                        "expirationDate"
                    )}**: ${DateTimeFormatHelper.dateToLocaleString(
                        new Date(warning.expirationDate * 1000),
                        language
                    )}\n\n` +
                    `**${localization.getTranslation("reason")}**:\n${
                        warning.reason
                    }`
            );

        return embed;
    }

    /**
     * Gets the localization for this creator utility.
     *
     * @param language The language to localize.
     */
    private static getLocalization(
        language: Language
    ): EmbedCreatorLocalization {
        return new EmbedCreatorLocalization(language);
    }
}
