import {
    ColorResolvable,
    CommandInteraction,
    Guild,
    GuildEmoji,
    GuildMember,
    MessageAttachment,
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
import { StarRatingCalculationResult } from "@alice-utils/dpp/StarRatingCalculationResult";
import { ClanAuction } from "@alice-database/utils/aliceDb/ClanAuction";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TournamentMatch } from "@alice-database/utils/elainaDb/TournamentMatch";
import { StarRatingCalculationParameters } from "@alice-utils/dpp/StarRatingCalculationParameters";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import { ScoreRank } from "@alice-types/utils/ScoreRank";
import { MapShare } from "@alice-database/utils/aliceDb/MapShare";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { MusicQueue } from "@alice-utils/music/MusicQueue";
import { RebalanceStarRatingCalculationResult } from "@alice-utils/dpp/RebalanceStarRatingCalculationResult";
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
    TailCircle,
    ModUtil,
} from "@rian8337/osu-base";
import {
    DroidStarRating,
    DroidPerformanceCalculator,
    OsuStarRating,
    OsuPerformanceCalculator,
} from "@rian8337/osu-difficulty-calculator";
import {
    DroidStarRating as RebalanceDroidStarRating,
    DroidPerformanceCalculator as RebalanceDroidPerformanceCalculator,
    OsuStarRating as RebalanceOsuStarRating,
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
import { EmbedCreatorLocalization, EmbedCreatorStrings } from "@alice-localization/utils/creators/EmbedCreatorLocalization";

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
        calculationParams?: StarRatingCalculationParameters,
        language: Language = "en"
    ): MessageOptions {
        const localization: EmbedCreatorLocalization = new EmbedCreatorLocalization(language);

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
                        )
                    )
                    .setURL(`https://osu.ppy.sh/b/${beatmapInfo.beatmapID}`)
                    .addField(
                        beatmapInfo.showStatistics(
                            2,
                            calculationParams?.customStatistics
                        ),
                        beatmapInfo.showStatistics(
                            3,
                            calculationParams?.customStatistics
                        )
                    )
                    .addField(
                        beatmapInfo.showStatistics(
                            4,
                            calculationParams?.customStatistics
                        ),
                        beatmapInfo.showStatistics(
                            5,
                            calculationParams?.customStatistics
                        )
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
        interaction: CommandInteraction,
        bindInfo: UserBind,
        ppRank?: number,
        language: Language = "en"
    ): Promise<MessageEmbed> {
        const localization: EmbedCreatorLocalization = new EmbedCreatorLocalization(language);

        const embed: MessageEmbed = this.createNormalEmbed({
            author: interaction.user,
            color: (<GuildMember | null>interaction.member)?.displayColor,
        });

        ppRank ??=
            await DatabaseManager.elainaDb.collections.userBind.getUserDPPRank(
                bindInfo.pptotal
            );

        embed.setDescription(
            `**${StringHelper.formatString(localization.getTranslation("ppProfileTitle"), `<@${bindInfo.discordid}> (${bindInfo.username})`)}**\n` +
            `: **${bindInfo.pptotal.toFixed(
                2
            )} pp (#${ppRank.toLocaleString()})**\n` +
            `[${localization.getTranslation("ppProfile")}](https://droidppboard.herokuapp.com/profile?uid=${bindInfo.uid})`
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
        interaction: CommandInteraction,
        title: string,
        description: string,
        language: Language = "en"
    ): MessageEmbed {
        const embed: MessageEmbed = this.createNormalEmbed({
            author: interaction.user,
            color: (<GuildMember | null>interaction.member)?.displayColor,
            footerText: this.getLocalization(language).getTranslation("exitMenu"),
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
        calculationParams: StarRatingCalculationParameters,
        droidCalculationResult:
            | StarRatingCalculationResult<DroidStarRating>
            | PerformanceCalculationResult<DroidPerformanceCalculator>
            | RebalanceStarRatingCalculationResult<RebalanceDroidStarRating>
            | RebalancePerformanceCalculationResult<RebalanceDroidPerformanceCalculator>,
        osuCalculationResult:
            | StarRatingCalculationResult<OsuStarRating>
            | PerformanceCalculationResult<OsuPerformanceCalculator>
            | RebalanceStarRatingCalculationResult<RebalanceOsuStarRating>
            | RebalancePerformanceCalculationResult<RebalanceOsuPerformanceCalculator>,
        graphColor?: string,
        language: Language = "en"
    ): Promise<MessageOptions> {
        const localization: EmbedCreatorLocalization = this.getLocalization(language);

        const embedOptions: MessageOptions = await this.createBeatmapEmbed(
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
                RebalancePerformanceCalculationResult) &&
            (osuCalculationResult instanceof PerformanceCalculationResult ||
                osuCalculationResult instanceof
                RebalancePerformanceCalculationResult)
        ) {
            const droidPP:
                | DroidPerformanceCalculator
                | RebalanceDroidPerformanceCalculator =
                droidCalculationResult.result;
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
                            pcPP.stars.total
                        )
                    )
                )
                .spliceFields(embed.fields.length - 1, 1)
                .addField(
                    map.showStatistics(4, customStatistics),
                    `${map.showStatistics(
                        5,
                        customStatistics
                    )}\n**${localization.getTranslation("result")}**: ${combo}/${map.maxCombo}x | ${(
                        accuracy.value() * 100
                    ).toFixed(2)}% | [${accuracy.n300}/${accuracy.n100}/${accuracy.n50
                    }/${accuracy.nmiss}]`
                )
                .addField(
                    `**${localization.getTranslation("droidPP")}**: __${droidPP.total.toFixed(2)} pp__${calculationParams.isEstimated ? ` (${localization.getTranslation("estimated")})` : ""
                    } - ${droidPP.stars.total.toFixed(2)}${Symbols.star}`,
                    `**${localization.getTranslation("pcPP")}**: ${pcPP.total.toFixed(2)} pp${calculationParams.isEstimated ? ` (${localization.getTranslation("estimated")})` : ""
                    } - ${pcPP.stars.total.toFixed(2)}${Symbols.star}`
                );
        } else {
            const droidCalcResult: RebalanceStarRatingCalculationResult<RebalanceDroidStarRating> =
                <
                RebalanceStarRatingCalculationResult<RebalanceDroidStarRating>
                >droidCalculationResult;

            const osuCalcResult: RebalanceStarRatingCalculationResult<RebalanceOsuStarRating> =
                <RebalanceStarRatingCalculationResult<RebalanceOsuStarRating>>(
                    osuCalculationResult
                );

            embed
                .setColor(
                    <ColorResolvable>(
                        BeatmapManager.getBeatmapDifficultyColor(
                            osuCalcResult.result.total
                        )
                    )
                )
                .addField(
                    `**${localization.getTranslation("starRating")}**`,
                    `${Symbols.star.repeat(
                        Math.min(10, Math.floor(droidCalcResult.result.total))
                    )} ${droidCalcResult.result.total.toFixed(
                        2
                    )} ${localization.getTranslation("droidStars")}\n` +
                    `${Symbols.star.repeat(
                        Math.min(10, Math.floor(osuCalcResult.result.total))
                    )} ${osuCalcResult.result.total.toFixed(2)} ${localization.getTranslation("pcStars")}`
                );
        }

        if (
            droidCalculationResult instanceof
            RebalancePerformanceCalculationResult &&
            osuCalculationResult instanceof
            RebalancePerformanceCalculationResult
        ) {
            embed.setDescription(
                `**${localization.getTranslation("rebalanceCalculationNote")}**\n` +
                embed.description
            );
        }

        const newRating: OsuStarRating | RebalanceOsuStarRating =
            osuCalculationResult instanceof PerformanceCalculationResult ||
                osuCalculationResult instanceof
                RebalancePerformanceCalculationResult
                ? osuCalculationResult.result.stars
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
        const localization: EmbedCreatorLocalization = this.getLocalization(language);

        const arrow: Symbols = Symbols.rightArrowSmall;

        const embed: MessageEmbed = this.createNormalEmbed({
            color: embedColor,
            footerText: StringHelper.formatString(localization.getTranslation("dateAchieved"), score.date.toUTCString()),
        });

        embed.setAuthor({
            name: `${score.title} ${score.getCompleteModString()}`,
            iconURL: playerAvatarURL,
        });

        const droidCalcResult: PerformanceCalculationResult<DroidPerformanceCalculator> | null =
            await DroidBeatmapDifficultyHelper.calculateScorePerformance(score);

        const osuCalcResult: PerformanceCalculationResult<OsuPerformanceCalculator> | null =
            await OsuBeatmapDifficultyHelper.calculateScorePerformance(score);

        let beatmapInformation: string = `${arrow} **${BeatmapManager.getRankEmote(
            <ScoreRank>score.rank
        )}** ${arrow} `;

        if (!droidCalcResult || !osuCalcResult) {
            beatmapInformation +=
                `${(score.accuracy.value() * 100).toFixed(2)}%\n` +
                `${arrow} ${score.score.toLocaleString()} ${arrow} ${score.combo
                }x ${arrow} [${score.accuracy.n300}/${score.accuracy.n100}/${score.accuracy.n50
                }/${score.accuracy.nmiss}]`;

            embed.setDescription(beatmapInformation);
            return embed;
        }

        embed
            .setAuthor({
                name: `${osuCalcResult.map.fullTitle
                    } ${score.getCompleteModString()} [${droidCalcResult.result.stars.total.toFixed(
                        2
                    )}${Symbols.star} | ${osuCalcResult.result.stars.total.toFixed(
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
        )}DPP**${(droidCalcResult.replay?.tapPenalty ?? 1) !== 1
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
            const droidFcCalcResult: PerformanceCalculationResult<DroidPerformanceCalculator> =
                (await DroidBeatmapDifficultyHelper.calculateBeatmapPerformance(
                    new StarRatingCalculationResult(
                        droidCalcResult.map,
                        droidCalcResult.result.stars
                    ),
                    calcParams
                ))!;

            // Safe to non-null since previous calculation works.
            const osuFcCalcResult: PerformanceCalculationResult<OsuPerformanceCalculator> =
                (await OsuBeatmapDifficultyHelper.calculateBeatmapPerformance(
                    new StarRatingCalculationResult(
                        osuCalcResult.map,
                        osuCalcResult.result.stars
                    ),
                    calcParams
                ))!;

            beatmapInformation += `(${droidFcCalcResult.result.total.toFixed(
                2
            )}DPP, ${osuFcCalcResult.result.total.toFixed(2)}PP ${StringHelper.formatString(localization.getTranslation("forFC"), (calcParams.accuracy.value() * 100).toFixed(2))}) `;
        }

        beatmapInformation +=
            `${arrow} ${(score.accuracy.value() * 100).toFixed(2)}%\n` +
            `${arrow} ${score.score.toLocaleString()} ${arrow} ${score.combo
            }x/${osuCalcResult.map.maxCombo}x ${arrow} [${score.accuracy.n300
            }/${score.accuracy.n100}/${score.accuracy.n50}/${score.accuracy.nmiss
            }]`;

        if (!score.replay) {
            await score.downloadReplay();
        }

        const replayData: ReplayData | undefined | null = score.replay?.data;

        if (replayData) {
            score.replay!.map ??= droidCalcResult.result.stars;

            // Get amount of slider ticks and ends hit
            let collectedSliderTicks: number = 0;
            let collectedSliderEnds: number = 0;

            for (let i = 0; i < replayData.hitObjectData.length; ++i) {
                // Using droid star rating as legacy slider tail doesn't exist.
                const object: HitObject =
                    droidCalcResult.result.stars.map.objects[i];
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
                    } else if (nested instanceof TailCircle) {
                        ++collectedSliderEnds;
                    }
                }
            }

            beatmapInformation += `\n${arrow} ${collectedSliderTicks}/${droidCalcResult.result.stars.map.sliderTicks} ${localization.getTranslation("sliderTicks")} ${arrow} ${collectedSliderEnds}/${droidCalcResult.result.stars.map.sliderEnds} ${localization.getTranslation("sliderEnds")}`;

            // Get hit error average and UR
            const hitErrorInformation: HitErrorInformation =
                score.replay!.calculateHitError()!;

            beatmapInformation += `\n${arrow} ${hitErrorInformation.negativeAvg.toFixed(
                2
            )}ms - ${hitErrorInformation.positiveAvg.toFixed(
                2
            )}ms ${localization.getTranslation("hitErrorAvg")} ${arrow} ${hitErrorInformation.unstableRate.toFixed(
                2
            )} UR`;
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
        const localization: EmbedCreatorLocalization = this.getLocalization(language);

        const calcParams: StarRatingCalculationParameters =
            new StarRatingCalculationParameters(
                new MapStats({
                    mods: ModUtil.pcStringToMods(challenge.constrain),
                })
            );

        const droidCalcResult: StarRatingCalculationResult<DroidStarRating> =
            (await DroidBeatmapDifficultyHelper.calculateBeatmapDifficulty(
                challenge.beatmapid,
                calcParams
            ))!;

        const osuCalcResult: StarRatingCalculationResult<OsuStarRating> =
            (await OsuBeatmapDifficultyHelper.calculateBeatmapDifficulty(
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
            .setFooter({
                text:
                    embed.footer!.text! +
                    ` | ${localization.getTranslation("challengeId")}: ${challenge.challengeid
                    } | ${localization.getTranslation("timeLeft")}: ${DateTimeFormatHelper.secondsToDHMS(
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
                name:
                    localization.getTranslation(challenge.type === "weekly"
                        ? "weeklyChallengeTitle"
                        : "dailyChallengeTitle"),
                iconURL: `attachment://osu-${osuCalcResult.result.total.toFixed(
                    2
                )}.png`,
            })
            .setDescription(
                `${localization.getTranslation("featuredPerson")} <@${challenge.featured}>\n` +
                `${localization.getTranslation("download")}: [Google Drive](${challenge.link[0]})${challenge.link[1]
                    ? ` - [OneDrive](${challenge.link[1]})`
                    : ""
                }`
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
                )} ${osuCalcResult.result.total.toFixed(2)} ${localization.getTranslation("pcStars")}`,
                `**${localization.getTranslation("points")}**: ${challenge.points} ${localization.getTranslation("points")}\n` +
                `**${localization.getTranslation("passCondition")}**: ${challenge.getPassInformation()}\n` +
                `**${localization.getTranslation("constrain")}**: ${challenge.constrain
                    ? StringHelper.formatString(localization.getTranslation("modOnly"), challenge.constrain.toUpperCase())
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

        return {
            embeds: [embed],
            files: files,
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
        const localization: EmbedCreatorLocalization = this.getLocalization(language);

        const embed: MessageEmbed = this.createNormalEmbed({
            color: "#cb9000",
        });

        embed
            .setTitle(localization.getTranslation("auctionInfo"))
            .setDescription(
                `**${localization.getTranslation("auctionName")}**: ${auction.name}\n` +
                `**${localization.getTranslation("auctionAuctioneer")}**: ${auction.auctioneer}\n` +
                `**${localization.getTranslation("creationDate")}**: ${new Date(
                    auction.creationdate * 1000
                ).toUTCString()}\n` +
                `**${localization.getTranslation("auctionMinimumBid")}**: ${coinEmoji}${auction.min_price} Alice coins`
            )
            .addField(
                localization.getTranslation("auctionItemInfo"),
                `**${localization.getTranslation("auctionPowerup")}**: ${StringHelper.capitalizeString(
                    auction.powerup
                )}\n` + `**${localization.getTranslation("auctionItemAmount")}**: ${auction.amount.toLocaleString()}`
            )
            .addField(
                localization.getTranslation("auctionBidInfo"),
                `**${localization.getTranslation("auctionBidders")}**: ${auction.bids.size.toLocaleString()}\n` +
                `**${localization.getTranslation("auctionTopBidders")}**:\n` +
                auction.bids
                    .first(5)
                    .map(
                        (v, i) =>
                            `#${i + 1}: ${v.clan} - ${coinEmoji}\`${v.amount
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
    static createReportBroadcastEmbed(guild: Guild, language: Language = "en"): MessageEmbed {
        const localization: EmbedCreatorLocalization = this.getLocalization(language);

        const embed: MessageEmbed = this.createNormalEmbed({
            color: "#b566ff",
        });

        embed
            .setAuthor({
                name: localization.getTranslation("broadcast"),
                iconURL: guild.iconURL({ dynamic: true })!,
            })
            .setDescription(
                `${localization.getTranslation("broadcast1")}\n\n${localization.getTranslation("broadcast2")}`
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
        const localization: EmbedCreatorLocalization = this.getLocalization(language);

        const calcParams: StarRatingCalculationParameters =
            new StarRatingCalculationParameters();

        const droidCalcResult: StarRatingCalculationResult<DroidStarRating> =
            (await DroidBeatmapDifficultyHelper.calculateBeatmapDifficulty(
                submission.beatmap_id,
                calcParams
            ))!;

        const osuCalcResult: StarRatingCalculationResult<OsuStarRating> =
            (await OsuBeatmapDifficultyHelper.calculateBeatmapDifficulty(
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
                name: StringHelper.formatString(localization.getTranslation("mapShareSubmission"), submission.submitter),
                iconURL: `attachment://osu-${osuCalcResult.result.total.toFixed(
                    2
                )}.png`,
            })
            .addField(
                `**${localization.getTranslation("starRating")}**`,
                `${Symbols.star.repeat(
                    Math.min(10, Math.floor(droidCalcResult.result.total))
                )} ${droidCalcResult.result.total.toFixed(2)} ${localization.getTranslation("droidStars")}\n` +
                `${Symbols.star.repeat(
                    Math.min(10, Math.floor(osuCalcResult.result.total))
                )} ${osuCalcResult.result.total.toFixed(2)} ${localization.getTranslation("pcStars")}`
            )
            .addField(
                `**${localization.getTranslation("mapShareStatusAndSummary")}**`,
                `**${localization.getTranslation("mapShareStatus")}**: ${StringHelper.capitalizeString(
                    localization.getTranslation(
                        <keyof EmbedCreatorStrings>
                        `mapShareStatus${StringHelper.capitalizeString(submission.status)}`
                    )
                )}\n\n` + `**${localization.getTranslation("mapShareSummary")}**:\n${submission.summary}`
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
    static createMusicQueueEmbed(queue: MusicQueue, language: Language = "en"): MessageEmbed {
        const localization: EmbedCreatorLocalization = this.getLocalization(language);

        const embed: MessageEmbed = this.createNormalEmbed();

        embed
            .setTitle(queue.information.title)
            .setThumbnail(queue.information.thumbnail)
            .setDescription(
                `${localization.getTranslation("musicYoutubeChannel")}: ${queue.information.author.name
                }\n\n${localization.getTranslation("musicDuration")}: ${queue.information.duration.toString()}\n\n${StringHelper.formatString(localization.getTranslation("musicQueuer"), `<@${queue.queuer}>`)}`
            )
            .setURL(queue.information.url);

        return embed;
    }

    /**
     * Gets the localization for this creator utility.
     * 
     * @param language The language to localize.
     */
    private static getLocalization(language: Language): EmbedCreatorLocalization {
        return new EmbedCreatorLocalization(language);
    }
}
