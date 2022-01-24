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
import { MapInfo, Accuracy, MapStats, Precision, HitObject, Slider, SliderTick, TailCircle, ModUtil } from "@rian8337/osu-base";
import { DroidStarRating, DroidPerformanceCalculator, OsuStarRating, OsuPerformanceCalculator } from "@rian8337/osu-difficulty-calculator";
import {
    DroidStarRating as RebalanceDroidStarRating,
    DroidPerformanceCalculator as RebalanceDroidPerformanceCalculator,
    OsuStarRating as RebalanceOsuStarRating,
    OsuPerformanceCalculator as RebalanceOsuPerformanceCalculator,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import { ReplayData, ReplayObjectData, hitResult, HitErrorInformation } from "@rian8337/osu-droid-replay-analyzer";
import { Score } from "@rian8337/osu-droid-utilities";
import getStrainChart from "@rian8337/osu-strain-graph-generator";

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
     */
    static createBeatmapEmbed(
        beatmapInfo: MapInfo,
        calculationParams?: StarRatingCalculationParameters
    ): MessageOptions {
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
                        name: "Beatmap Information",
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
     * @returns The embed.
     */
    static async createDPPListEmbed(
        interaction: CommandInteraction,
        bindInfo: UserBind,
        ppRank?: number
    ): Promise<MessageEmbed> {
        const embed: MessageEmbed = this.createNormalEmbed({
            author: interaction.user,
            color: (<GuildMember | null>interaction.member)?.displayColor,
        });

        ppRank ??=
            await DatabaseManager.elainaDb.collections.userBind.getUserDPPRank(
                bindInfo.pptotal
            );

        embed.setDescription(
            `**PP Profile for <@${bindInfo.discordid}> (${bindInfo.username})**\n` +
            `Total PP: **${bindInfo.pptotal.toFixed(
                2
            )} pp (#${ppRank.toLocaleString()})**\n` +
            `[PP Profile](https://droidppboard.herokuapp.com/profile?uid=${bindInfo.uid})`
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
        description: string
    ): MessageEmbed {
        const embed: MessageEmbed = this.createNormalEmbed({
            author: interaction.user,
            color: (<GuildMember | null>interaction.member)?.displayColor,
            footerText: 'Type "exit" to exit this menu',
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
        graphColor?: string
    ): Promise<MessageOptions> {
        const embedOptions: MessageOptions = this.createBeatmapEmbed(
            osuCalculationResult.map,
            calculationParams
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
                    )}\n**Result**: ${combo}/${map.maxCombo}x | ${(
                        accuracy.value() * 100
                    ).toFixed(2)}% | [${accuracy.n300}/${accuracy.n100}/${accuracy.n50
                    }/${accuracy.nmiss}]`
                )
                .addField(
                    `**Droid pp**: __${droidPP.total.toFixed(2)} pp__${calculationParams.isEstimated ? " (estimated)" : ""
                    } - ${droidPP.stars.total.toFixed(2)} stars`,
                    `**PC pp**: ${pcPP.total.toFixed(2)} pp${calculationParams.isEstimated ? " (estimated)" : ""
                    } - ${pcPP.stars.total.toFixed(2)} stars`
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
                    `**Star Rating**`,
                    `${Symbols.star.repeat(
                        Math.min(10, Math.floor(droidCalcResult.result.total))
                    )} ${droidCalcResult.result.total.toFixed(
                        2
                    )} droid stars\n` +
                    `${Symbols.star.repeat(
                        Math.min(10, Math.floor(osuCalcResult.result.total))
                    )} ${osuCalcResult.result.total.toFixed(2)} PC stars`
                );
        }

        if (
            droidCalculationResult instanceof
            RebalancePerformanceCalculationResult &&
            osuCalculationResult instanceof
            RebalancePerformanceCalculationResult
        ) {
            embed.setDescription(
                "**The resulting values are subject to change.**\n" +
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
                name: "Beatmap Information",
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
     * @returns The embed.
     */
    static async createRecentPlayEmbed(
        score: Score,
        playerAvatarURL: string,
        embedColor?: ColorResolvable
    ): Promise<MessageEmbed> {
        const arrow: Symbols = Symbols.rightArrowSmall;

        const embed: MessageEmbed = this.createNormalEmbed({
            color: embedColor,
            footerText: `Achieved on ${score.date.toUTCString()}`,
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
            ? " (*penalized*)"
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
            )}DPP, ${osuFcCalcResult.result.total.toFixed(2)}PP for ${(
                calcParams.accuracy.value() * 100
            ).toFixed(2)}% FC) `;
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

            beatmapInformation += `\n${arrow} ${collectedSliderTicks}/${droidCalcResult.result.stars.map.sliderTicks} slider ticks ${arrow} ${collectedSliderEnds}/${droidCalcResult.result.stars.map.sliderEnds} slider ends`;

            // Get hit error average and UR
            const hitErrorInformation: HitErrorInformation =
                score.replay!.calculateHitError()!;

            beatmapInformation += `\n${arrow} ${hitErrorInformation.negativeAvg.toFixed(
                2
            )}ms - ${hitErrorInformation.positiveAvg.toFixed(
                2
            )}ms hit error avg ${arrow} ${hitErrorInformation.unstableRate.toFixed(
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
     * @returns The options for the embed.
     */
    static async createChallengeEmbed(
        challenge: Challenge,
        graphColor?: string
    ): Promise<MessageOptions> {
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
            osuCalcResult
        );

        const embed: MessageEmbed = <MessageEmbed>embedOptions.embeds![0];

        embed
            .setFooter({
                text:
                    embed.footer!.text! +
                    ` | Challenge ID: ${challenge.challengeid
                    } | Time left: ${DateTimeFormatHelper.secondsToDHMS(
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
                    challenge.type === "weekly"
                        ? "osu!droid Weekly Bounty Challenge"
                        : "osu!droid Daily Challenge",
                iconURL: `attachment://osu-${osuCalcResult.result.total.toFixed(
                    2
                )}.png`,
            })
            .setDescription(
                `Featured by <@${challenge.featured}>\n` +
                `Download: [Google Drive](${challenge.link[0]})${challenge.link[1]
                    ? ` - [OneDrive](${challenge.link[1]})`
                    : ""
                }`
            )
            .addField(
                `**Star Rating**\n` +
                `${Symbols.star.repeat(
                    Math.min(10, Math.floor(droidCalcResult.result.total))
                )} ${droidCalcResult.result.total.toFixed(
                    2
                )} droid stars\n` +
                `${Symbols.star.repeat(
                    Math.min(10, Math.floor(osuCalcResult.result.total))
                )} ${osuCalcResult.result.total.toFixed(2)} PC stars`,
                `**Point(s)**: ${challenge.points} points\n` +
                `**Pass Condition**: ${challenge.getPassInformation()}\n` +
                `**Constrain**: ${challenge.constrain
                    ? `${challenge.constrain.toUpperCase()} mod only`
                    : "Any rankable mod except EZ, NF, and HT"
                }\n\n` +
                "Use `/daily challenges` to check bonuses."
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
     * @returns The embed.
     */
    static createClanAuctionEmbed(
        auction: ClanAuction,
        coinEmoji: GuildEmoji
    ): MessageEmbed {
        const embed: MessageEmbed = this.createNormalEmbed({
            color: "#cb9000",
        });

        embed
            .setTitle("Auction Information")
            .setDescription(
                `**Name**: ${auction.name}\n` +
                `**Auctioneer**: ${auction.auctioneer}\n` +
                `**Creation Date**: ${new Date(
                    auction.creationdate * 1000
                ).toUTCString()}\n` +
                `**Minimum Bid Amount**: ${coinEmoji}${auction.min_price} Alice coins`
            )
            .addField(
                "Item Information",
                `**Powerup**: ${StringHelper.capitalizeString(
                    auction.powerup
                )}\n` + `**Amount**: ${auction.amount.toLocaleString()}`
            )
            .addField(
                "Bid Information",
                `**Bidders**: ${auction.bids.size.toLocaleString()}\n` +
                `**Top Bidders**:\n` +
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
     * @returns The embed.
     */
    static createReportBroadcastEmbed(guild: Guild): MessageEmbed {
        const embed: MessageEmbed = this.createNormalEmbed({
            color: "#b566ff",
        });

        embed
            .setAuthor({
                name: "Broadcast",
                iconURL: guild.iconURL({ dynamic: true })!,
            })
            .setDescription(
                `If you see a user violating the rules, misbehaving, or intentionally trying to be annoying, please report the user using \`/report\` command (more information is available using \`/help report\`).\n\n` +
                `Keep in mind that only staff members can view reports, therefore your privacy is safe. We appreciate your contribution towards bringing a friendly environment!`
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
        submission: MapShare
    ): Promise<MessageOptions> {
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
            "#28ebda"
        );

        const embed: MessageEmbed = <MessageEmbed>embedOptions.embeds![0];

        embed
            .setImage("attachment://chart.png")
            .setAuthor({
                name: `Submission by ${submission.submitter}`,
                iconURL: `attachment://osu-${osuCalcResult.result.total.toFixed(
                    2
                )}.png`,
            })
            .addField(
                "**Star Rating**",
                `${Symbols.star.repeat(
                    Math.min(10, Math.floor(droidCalcResult.result.total))
                )} ${droidCalcResult.result.total.toFixed(2)} droid stars\n` +
                `${Symbols.star.repeat(
                    Math.min(10, Math.floor(osuCalcResult.result.total))
                )} ${osuCalcResult.result.total.toFixed(2)} PC stars`
            )
            .addField(
                "**Status and Summary**",
                `**Status**: ${StringHelper.capitalizeString(
                    submission.status
                )}\n\n` + `**Summary**:\n${submission.summary}`
            );

        return embedOptions;
    }

    /**
     * Gets an embed representing a music queue.
     *
     * @param queue The music queue.
     * @returns The embed.
     */
    static createMusicQueueEmbed(queue: MusicQueue): MessageEmbed {
        const embed: MessageEmbed = this.createNormalEmbed();

        embed
            .setTitle(queue.information.title)
            .setThumbnail(queue.information.thumbnail)
            .setDescription(
                `Channel: ${queue.information.author.name
                }\n\nDuration: ${queue.information.duration.toString()}\n\nQueued/requested by <@${queue.queuer
                }>`
            )
            .setURL(queue.information.url);

        return embed;
    }
}
