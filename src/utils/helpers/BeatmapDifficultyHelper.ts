import {
    Accuracy,
    Beatmap,
    MapInfo,
    MapStats,
    Mod,
    ModUtil,
} from "@rian8337/osu-base";
import { Score } from "@rian8337/osu-droid-utilities";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import {
    CacheableDifficultyAttributes,
    DifficultyAttributes,
    DifficultyCalculator,
    DifficultyHitObject,
    PerformanceCalculator,
} from "@rian8337/osu-difficulty-calculator";
import {
    DifficultyAttributes as RebalanceDifficultyAttributes,
    DifficultyCalculator as RebalanceDifficultyCalculator,
    DifficultyHitObject as RebalanceDifficultyHitObject,
    PerformanceCalculator as RebalancePerformanceCalculator,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { RebalancePerformanceCalculationResult } from "@alice-utils/dpp/RebalancePerformanceCalculationResult";
import { RebalanceDifficultyCalculationResult } from "@alice-utils/dpp/RebalanceDifficultyCalculationResult";
import { DifficultyCalculationParameters } from "@alice-utils/dpp/DifficultyCalculationParameters";
import { DifficultyCalculationResult } from "@alice-utils/dpp/DifficultyCalculationResult";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { DifficultyAttributesCacheManager } from "@alice-utils/difficultyattributescache/DifficultyAttributesCacheManager";
import { RecentPlay } from "@alice-database/utils/aliceDb/RecentPlay";
import { NumberHelper } from "./NumberHelper";

/**
 * A helper class for calculating difficulty and performance of beatmaps or scores.
 */
export abstract class BeatmapDifficultyHelper<
    DA extends DifficultyAttributes,
    RDA extends RebalanceDifficultyAttributes,
    DC extends DifficultyCalculator<DifficultyHitObject, DA>,
    PC extends PerformanceCalculator<DA>,
    RDC extends RebalanceDifficultyCalculator<
        RebalanceDifficultyHitObject,
        RDA
    >,
    RPC extends RebalancePerformanceCalculator<RDA>,
> {
    /**
     * The difficulty calculator to use.
     */
    protected abstract readonly difficultyCalculator: new (
        beatmap: Beatmap,
    ) => DC;

    /**
     * The rebalance difficulty calculator to use.
     */
    protected abstract readonly rebalanceDifficultyCalculator: new (
        beatmap: Beatmap,
    ) => RDC;

    /**
     * The performance calculator to use.
     */
    protected abstract readonly performanceCalculator: new (
        difficultyAttributes: DA,
    ) => PC;

    /**
     * The rebalance performance calculator to use.
     */
    protected abstract readonly rebalancePerformanceCalculator: new (
        difficultyAttributes: RDA,
    ) => RPC;

    /**
     * The cache manager responsible for storing live calculation difficulty attributes.
     */
    protected abstract readonly liveDifficultyAttributesCache: DifficultyAttributesCacheManager<DA>;

    /**
     * The cache manager responsible for storing rebalance calculation difficulty attributes.
     */
    protected abstract readonly rebalanceDifficultyAttributesCache: DifficultyAttributesCacheManager<RDA>;

    /**
     * Gets calculation parameters from a user's message.
     *
     * @param message The user's message.
     * @returns The calculation parameters from the user's message.
     */
    static getCalculationParamsFromMessage(
        message: string,
    ): PerformanceCalculationParameters {
        const mods: Mod[] = [];
        let combo: number | undefined;
        let forceCS: number | undefined;
        let forceAR: number | undefined;
        let forceOD: number | undefined;
        let speedMultiplier: number = 1;
        let accPercent: number = 100;
        let countMiss: number = 0;
        let count100: number = 0;
        let count50: number = 0;

        for (const input of message.split(/\s+/g)) {
            if (input.endsWith("%")) {
                const newAccPercent = parseFloat(input);
                if (!Number.isNaN(newAccPercent)) {
                    accPercent = NumberHelper.clamp(newAccPercent, 0, 100);
                }
            }
            if (input.endsWith("m")) {
                const newCountMiss = parseInt(input);
                if (!Number.isNaN(newCountMiss)) {
                    countMiss = Math.max(0, newCountMiss);
                }
            }
            if (input.endsWith("x")) {
                if (input.includes(".")) {
                    const newSpeedMultiplier = parseFloat(input);
                    if (!Number.isNaN(newSpeedMultiplier)) {
                        speedMultiplier = Math.max(
                            0.5,
                            Math.min(
                                2,
                                NumberHelper.round(newSpeedMultiplier, 2),
                            ),
                        );
                    }
                } else {
                    const newCombo = parseInt(input);
                    if (!Number.isNaN(newCombo)) {
                        combo = Math.max(0, newCombo);
                    }
                }
            }
            if (input.startsWith("+")) {
                mods.push(...ModUtil.pcStringToMods(input.replace("+", "")));
            }
            if (input.startsWith("CS")) {
                const newForceCS = parseFloat(input.substring(2));
                if (!Number.isNaN(newForceCS)) {
                    forceCS = NumberHelper.clamp(
                        NumberHelper.round(newForceCS, 2),
                        0,
                        15,
                    );
                }
            }
            if (input.startsWith("AR")) {
                const newForceAR = parseFloat(input.substring(2));
                if (!Number.isNaN(newForceAR)) {
                    forceAR = NumberHelper.clamp(
                        NumberHelper.round(newForceAR, 2),
                        0,
                        12.5,
                    );
                }
            }
            if (input.startsWith("OD")) {
                const newForceOD = parseFloat(input.substring(2));
                if (!Number.isNaN(newForceOD)) {
                    forceOD = NumberHelper.clamp(
                        NumberHelper.round(newForceOD, 2),
                        0,
                        11,
                    );
                }
            }
            if (input.endsWith("x50")) {
                const newCount50 = parseInt(input);
                if (!Number.isNaN(newCount50)) {
                    count50 = Math.max(0, newCount50);
                }
            }
            if (input.endsWith("x100")) {
                const newCount100 = parseInt(input);
                if (!Number.isNaN(newCount100)) {
                    count100 = Math.max(0, newCount100);
                }
            }
        }

        return new PerformanceCalculationParameters(
            new Accuracy({
                n100: count100,
                n50: count50,
                nmiss: countMiss,
            }),
            accPercent,
            combo,
            undefined,
            new MapStats({
                mods: mods,
                cs: forceCS,
                ar: forceAR,
                od: forceOD,
                speedMultiplier: speedMultiplier,
                forceCS: !isNaN(forceCS!),
                forceAR: !isNaN(forceAR!),
                forceOD: !isNaN(forceOD!),
            }),
        );
    }

    /**
     * Gets calculation parameters from a score.
     *
     * @param score The score.
     * @returns Calculation parameters of the score.
     */
    static getCalculationParamsFromScore(
        score: Score | RecentPlay,
    ): PerformanceCalculationParameters {
        return new PerformanceCalculationParameters(
            score.accuracy,
            score.accuracy.value() * 100,
            score.combo,
            undefined,
            new MapStats({
                mods: score.mods,
                cs: score.forceCS,
                ar: score.forceAR,
                od: score.forceOD,
                speedMultiplier: score.speedMultiplier,
                forceCS: !Number.isNaN(score.forceCS),
                forceAR: !Number.isNaN(score.forceAR),
                forceOD: !Number.isNaN(score.forceOD),
                forceHP: !Number.isNaN(score.forceHP),
                oldStatistics:
                    score instanceof Score ? score.oldStatistics : false,
            }),
        );
    }

    /**
     * Calculates the difficulty and performance value of a score.
     *
     * @param score The score.
     * @param calcParams Calculation parameters to override the score's default calculation parameters.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    async calculateScorePerformance(
        score: Score,
        calcParams?: PerformanceCalculationParameters,
    ): Promise<PerformanceCalculationResult<DC, PC> | null> {
        const beatmap: MapInfo | null = await BeatmapManager.getBeatmap(
            score.hash,
            { checkFile: false },
        );

        if (!beatmap) {
            return null;
        }

        calcParams ??=
            BeatmapDifficultyHelper.getCalculationParamsFromScore(score);

        const attributeName: string =
            this.liveDifficultyAttributesCache.getAttributeName(
                score.mods,
                score.oldStatistics,
                score.speedMultiplier,
                score.forceCS,
                score.forceAR,
                score.forceOD,
            );

        let cachedAttributes: CacheableDifficultyAttributes<DA> | null =
            this.liveDifficultyAttributesCache.getDifficultyAttributes(
                beatmap,
                attributeName,
            );

        let difficultyCalculator: DC | undefined;

        if (!cachedAttributes) {
            const result: DifficultyCalculationResult<DA, DC> | null =
                await this.calculateDifficulty(beatmap, calcParams);

            if (result) {
                difficultyCalculator = result.result;
                cachedAttributes = result.cachedAttributes;
            }
        }

        if (!cachedAttributes) {
            return null;
        }

        const difficultyAttributes: DA = <DA>{
            ...cachedAttributes,
            mods: <Mod[]>score.mods,
        };

        return this.calculatePerformance(
            difficultyAttributes,
            calcParams,
            difficultyCalculator,
        );
    }

    /**
     * Calculates the rebalance difficulty and performance value of a score.
     *
     * @param score The score.
     * @param calcParams Calculation parameters to override the score's default calculation parameters.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    async calculateScoreRebalancePerformance(
        score: Score,
        calcParams?: PerformanceCalculationParameters,
    ): Promise<RebalancePerformanceCalculationResult<RDC, RPC> | null> {
        const beatmap: MapInfo | null = await BeatmapManager.getBeatmap(
            score.hash,
            { checkFile: false },
        );

        if (!beatmap) {
            return null;
        }

        calcParams ??=
            BeatmapDifficultyHelper.getCalculationParamsFromScore(score);

        const attributeName: string =
            this.rebalanceDifficultyAttributesCache.getAttributeName(
                score.mods,
                score.oldStatistics,
                score.speedMultiplier,
                score.forceCS,
                score.forceAR,
                score.forceOD,
            );

        let cachedAttributes: CacheableDifficultyAttributes<RDA> | null =
            this.rebalanceDifficultyAttributesCache.getDifficultyAttributes(
                beatmap,
                attributeName,
            );

        let difficultyCalculator: RDC | undefined;

        if (!cachedAttributes) {
            const result: RebalanceDifficultyCalculationResult<
                RDA,
                RDC
            > | null = await this.calculateRebalanceDifficulty(
                beatmap,
                calcParams,
            );

            if (result) {
                difficultyCalculator = result.result;
                cachedAttributes = result.cachedAttributes;
            }
        }

        if (!cachedAttributes) {
            return null;
        }

        const difficultyAttributes: RDA = <RDA>{
            ...cachedAttributes,
            mods: <Mod[]>score.mods,
        };

        return this.calculateRebalancePerformance(
            difficultyAttributes,
            calcParams,
            difficultyCalculator,
        );
    }

    /**
     * Calculates the difficulty and/or performance value of a beatmap.
     *
     * @param beatmap The beatmap to calculate.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    async calculateBeatmapPerformance(
        beatmap: MapInfo,
        calculationParams?: PerformanceCalculationParameters,
    ): Promise<PerformanceCalculationResult<DC, PC> | null>;

    /**
     * Calculates the difficulty and/or performance value of a beatmap.
     *
     * @param attributes The difficulty attributes of the beatmap.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    async calculateBeatmapPerformance(
        attributes: DA,
        calculationParams?: PerformanceCalculationParameters,
    ): Promise<PerformanceCalculationResult<DC, PC>>;

    /**
     * Calculates the difficulty and/or performance value of a beatmap.
     *
     * @param beatmapIdOrHash The ID or MD5 hash of the beatmap.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    async calculateBeatmapPerformance(
        beatmapIdOrHash: number | string,
        calculationParams?: PerformanceCalculationParameters,
    ): Promise<PerformanceCalculationResult<DC, PC> | null>;

    async calculateBeatmapPerformance(
        beatmapOrHashOrDA: MapInfo | number | string | DA,
        calculationParams?: PerformanceCalculationParameters,
    ): Promise<PerformanceCalculationResult<DC, PC> | null> {
        let beatmap: MapInfo | null;

        if (beatmapOrHashOrDA instanceof MapInfo) {
            beatmap = beatmapOrHashOrDA;
        } else if (
            typeof beatmapOrHashOrDA === "number" ||
            typeof beatmapOrHashOrDA === "string"
        ) {
            beatmap = await BeatmapManager.getBeatmap(beatmapOrHashOrDA, {
                checkFile: false,
            });
        } else {
            return this.calculatePerformance(
                beatmapOrHashOrDA,
                calculationParams ??
                    new PerformanceCalculationParameters(
                        new Accuracy({
                            n300:
                                beatmapOrHashOrDA.hitCircleCount +
                                beatmapOrHashOrDA.sliderCount +
                                beatmapOrHashOrDA.spinnerCount,
                        }),
                        100,
                        beatmapOrHashOrDA.maxCombo,
                    ),
            );
        }

        if (!beatmap) {
            return null;
        }

        calculationParams ??= new PerformanceCalculationParameters(
            new Accuracy({
                n300: beatmap.objects,
            }),
            100,
            beatmap.maxCombo,
        );

        const { customStatistics } = calculationParams;

        const attributeName: string =
            this.liveDifficultyAttributesCache.getAttributeName(
                customStatistics?.mods,
                customStatistics?.oldStatistics,
                customStatistics?.speedMultiplier,
                customStatistics?.forceCS ? customStatistics.cs : undefined,
                customStatistics?.forceAR ? customStatistics.ar : undefined,
                customStatistics?.forceOD ? customStatistics.od : undefined,
            );

        let cachedAttributes: CacheableDifficultyAttributes<DA> | null =
            this.liveDifficultyAttributesCache.getDifficultyAttributes(
                beatmap,
                attributeName,
            );

        let difficultyCalculator: DC | undefined;

        if (!cachedAttributes) {
            const star: DifficultyCalculationResult<DA, DC> | null =
                await this.calculateDifficulty(beatmap, calculationParams);

            if (star) {
                difficultyCalculator = star.result;
                cachedAttributes = star.cachedAttributes;
            }
        }

        if (!cachedAttributes) {
            return null;
        }

        const difficultyAttributes: DA = <DA>{
            ...cachedAttributes,
            mods: <Mod[]>customStatistics?.mods ?? [],
        };

        return this.calculatePerformance(
            difficultyAttributes,
            calculationParams,
            difficultyCalculator,
        );
    }

    /**
     * Calculates the rebalance difficulty and/or performance value of a beatmap.
     *
     * @param beatmap The beatmap to calculate.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    async calculateBeatmapRebalancePerformance(
        beatmap: MapInfo,
        calculationParams?: PerformanceCalculationParameters,
    ): Promise<RebalancePerformanceCalculationResult<RDC, RPC> | null>;

    /**
     * Calculates the rebalance difficulty and/or performance value of a beatmap.
     *
     * @param attributes The difficulty attributes of the beatmap.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    async calculateBeatmapRebalancePerformance(
        attributes: RDA,
        calculationParams?: PerformanceCalculationParameters,
    ): Promise<RebalancePerformanceCalculationResult<RDC, RPC>>;

    /**
     * Calculates the rebalance difficulty and/or performance value of a beatmap.
     *
     * @param beatmapIDorHash The ID or MD5 hash of the beatmap.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    async calculateBeatmapRebalancePerformance(
        beatmapIDorHash: number | string,
        calculationParams?: PerformanceCalculationParameters,
    ): Promise<RebalancePerformanceCalculationResult<RDC, RPC> | null>;

    async calculateBeatmapRebalancePerformance(
        beatmapOrHashOrDA: MapInfo | number | string | RDA,
        calculationParams?: PerformanceCalculationParameters,
    ): Promise<RebalancePerformanceCalculationResult<RDC, RPC> | null> {
        let beatmap: MapInfo | null;

        if (beatmapOrHashOrDA instanceof MapInfo) {
            beatmap = beatmapOrHashOrDA;
        } else if (
            typeof beatmapOrHashOrDA === "number" ||
            typeof beatmapOrHashOrDA === "string"
        ) {
            beatmap = await BeatmapManager.getBeatmap(beatmapOrHashOrDA, {
                checkFile: false,
            });
        } else {
            return this.calculateRebalancePerformance(
                beatmapOrHashOrDA,
                calculationParams ??
                    new PerformanceCalculationParameters(
                        new Accuracy({
                            n300:
                                beatmapOrHashOrDA.hitCircleCount +
                                beatmapOrHashOrDA.sliderCount +
                                beatmapOrHashOrDA.spinnerCount,
                        }),
                        100,
                        beatmapOrHashOrDA.maxCombo,
                    ),
            );
        }

        if (!beatmap) {
            return null;
        }

        calculationParams ??= new PerformanceCalculationParameters(
            new Accuracy({
                n300: beatmap.objects,
            }),
            100,
            beatmap.maxCombo,
        );

        const { customStatistics } = calculationParams;

        const attributeName: string =
            this.rebalanceDifficultyAttributesCache.getAttributeName(
                customStatistics?.mods,
                customStatistics?.oldStatistics,
                customStatistics?.speedMultiplier,
                customStatistics?.forceCS ? customStatistics.cs : undefined,
                customStatistics?.forceAR ? customStatistics.ar : undefined,
                customStatistics?.forceOD ? customStatistics.od : undefined,
            );

        let cachedAttributes: CacheableDifficultyAttributes<RDA> | null =
            this.rebalanceDifficultyAttributesCache.getDifficultyAttributes(
                beatmap,
                attributeName,
            );

        let difficultyCalculator: RDC | undefined;

        if (!cachedAttributes) {
            const star: RebalanceDifficultyCalculationResult<RDA, RDC> | null =
                await this.calculateRebalanceDifficulty(
                    beatmap,
                    calculationParams,
                );

            if (star) {
                difficultyCalculator = star.result;
                cachedAttributes = star.cachedAttributes;
            }
        }

        if (!cachedAttributes) {
            return null;
        }

        const difficultyAttributes: RDA = <RDA>{
            ...cachedAttributes,
            mods: <Mod[]>customStatistics?.mods ?? [],
        };

        return this.calculateRebalancePerformance(
            difficultyAttributes,
            calculationParams,
            difficultyCalculator,
        );
    }

    /**
     * Calculates the difficulty of the beatmap being played in a score.
     *
     * @param score The score to calculate.
     * @returns The calculation result.
     */
    async calculateScoreDifficulty(
        score: Score,
    ): Promise<DifficultyCalculationResult<DA, DC> | null> {
        const beatmap: MapInfo<true> | null = await BeatmapManager.getBeatmap(
            score.hash,
        );

        if (!beatmap) {
            return null;
        }

        return this.calculateDifficulty(
            beatmap,
            BeatmapDifficultyHelper.getCalculationParamsFromScore(score),
        );
    }

    /**
     * Calculates the rebalance difficulty of the beatmap being played in a score.
     *
     * @param score The score to calculate.
     * @returns The calculation result.
     */
    async calculateScoreRebalanceDifficulty(
        score: Score,
    ): Promise<RebalanceDifficultyCalculationResult<RDA, RDC> | null> {
        const beatmap: MapInfo<true> | null = await BeatmapManager.getBeatmap(
            score.hash,
        );

        if (!beatmap) {
            return null;
        }

        return this.calculateRebalanceDifficulty(
            beatmap,
            BeatmapDifficultyHelper.getCalculationParamsFromScore(score),
        );
    }

    /**
     * Calculates the difficulty of a beatmap.
     *
     * @param beatmap The beatmap.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    async calculateBeatmapDifficulty(
        beatmap: MapInfo,
        calculationParams: DifficultyCalculationParameters,
    ): Promise<DifficultyCalculationResult<DA, DC> | null>;

    /**
     * Calculates the difficulty of a beatmap.
     *
     * @param beatmapIdOrHash The ID or MD5 hash of the beatmap.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    async calculateBeatmapDifficulty(
        beatmapIdOrHash: number | string,
        calculationParams: DifficultyCalculationParameters,
    ): Promise<DifficultyCalculationResult<DA, DC> | null>;

    async calculateBeatmapDifficulty(
        beatmapOrIdOrHash: MapInfo | number | string,
        calculationParams: DifficultyCalculationParameters,
    ): Promise<DifficultyCalculationResult<DA, DC> | null> {
        const beatmap: MapInfo | null =
            beatmapOrIdOrHash instanceof MapInfo
                ? beatmapOrIdOrHash
                : await BeatmapManager.getBeatmap(beatmapOrIdOrHash);

        if (!beatmap) {
            return null;
        }

        return this.calculateDifficulty(beatmap, calculationParams);
    }

    /**
     * Calculates the rebalance difficulty of a beatmap.
     *
     * @param beatmap The beatmap.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    async calculateBeatmapRebalanceDifficulty(
        beatmap: MapInfo,
        calculationParams: DifficultyCalculationParameters,
    ): Promise<RebalanceDifficultyCalculationResult<RDA, RDC> | null>;

    /**
     * Calculates the rebalance difficulty of a beatmap.
     *
     * @param beatmapIdorHash The ID or MD5 hash of the beatmap.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    async calculateBeatmapRebalanceDifficulty(
        beatmapIdorHash: number | string,
        calculationParams: DifficultyCalculationParameters,
    ): Promise<RebalanceDifficultyCalculationResult<RDA, RDC> | null>;

    async calculateBeatmapRebalanceDifficulty(
        beatmapOrIdOrHash: MapInfo | number | string,
        calculationParams: DifficultyCalculationParameters,
    ): Promise<RebalanceDifficultyCalculationResult<RDA, RDC> | null> {
        const beatmap: MapInfo | null =
            beatmapOrIdOrHash instanceof MapInfo
                ? beatmapOrIdOrHash
                : await BeatmapManager.getBeatmap(beatmapOrIdOrHash);

        if (!beatmap) {
            return null;
        }

        return this.calculateRebalanceDifficulty(beatmap, calculationParams);
    }

    /**
     * Calculates the difficulty of a beatmap.
     *
     * @param beatmap The beatmap to calculate.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    private async calculateDifficulty(
        beatmap: MapInfo<true>,
        calculationParams: DifficultyCalculationParameters,
    ): Promise<DifficultyCalculationResult<DA, DC> | null> {
        await this.initBeatmap(beatmap);

        if (
            !beatmap.hasDownloadedBeatmap() ||
            beatmap.beatmap.hitObjects.objects.length === 0
        ) {
            return null;
        }

        const star: DC = new this.difficultyCalculator(
            beatmap.beatmap,
        ).calculate({
            mods: calculationParams.customStatistics?.mods,
            stats: calculationParams.customStatistics,
        });

        const { customStatistics } = calculationParams;

        return new DifficultyCalculationResult(
            beatmap,
            star,
            this.liveDifficultyAttributesCache.addAttribute(
                beatmap,
                <DA>star.attributes,
                customStatistics?.oldStatistics,
                customStatistics?.speedMultiplier,
                customStatistics?.forceCS ? customStatistics.cs : undefined,
                customStatistics?.forceAR ? customStatistics.ar : undefined,
                customStatistics?.forceOD ? customStatistics.od : undefined,
            ),
        );
    }

    /**
     * Calculates the rebalance difficulty of a beatmap.
     *
     * @param beatmap The beatmap to calculate.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    private async calculateRebalanceDifficulty(
        beatmap: MapInfo<true>,
        calculationParams: DifficultyCalculationParameters,
    ): Promise<RebalanceDifficultyCalculationResult<RDA, RDC> | null> {
        await this.initBeatmap(beatmap);

        if (
            !beatmap.hasDownloadedBeatmap() ||
            beatmap.beatmap.hitObjects.objects.length === 0
        ) {
            return null;
        }

        const star: RDC = new this.rebalanceDifficultyCalculator(
            beatmap.beatmap,
        ).calculate({
            mods: calculationParams.customStatistics?.mods,
            stats: calculationParams.customStatistics,
        });

        const { customStatistics } = calculationParams;

        return new RebalanceDifficultyCalculationResult(
            beatmap,
            star,
            this.rebalanceDifficultyAttributesCache.addAttribute(
                beatmap,
                <RDA>star.attributes,
                customStatistics?.oldStatistics,
                customStatistics?.speedMultiplier,
                customStatistics?.forceCS ? customStatistics.cs : undefined,
                customStatistics?.forceAR ? customStatistics.ar : undefined,
                customStatistics?.forceOD ? customStatistics.od : undefined,
            ),
        );
    }

    /**
     * Calculates the performance value of a beatmap.
     *
     * @param difficultyAttributes The difficulty attributes to calculate the performance value for.
     * @param calculationParams Calculation parameters.
     * @param difficultyCalculator The difficulty calculator that was used to calculate the beatmap.
     * @returns The result of the calculation.
     */
    private calculatePerformance(
        difficultyAttributes: DA,
        calculationParams: PerformanceCalculationParameters,
        difficultyCalculator?: DC,
    ): PerformanceCalculationResult<DC, PC> | null {
        calculationParams.applyFromAttributes(difficultyAttributes);

        const pp: PC = new this.performanceCalculator(
            difficultyAttributes,
        ).calculate({
            combo: calculationParams.combo,
            accPercent: calculationParams.accuracy,
            tapPenalty: calculationParams.tapPenalty,
            aimSliderCheesePenalty:
                calculationParams.sliderCheesePenalty?.aimPenalty,
            flashlightSliderCheesePenalty:
                calculationParams.sliderCheesePenalty?.flashlightPenalty,
            visualSliderCheesePenalty:
                calculationParams.sliderCheesePenalty?.visualPenalty,
        });

        return new PerformanceCalculationResult(
            calculationParams,
            pp,
            difficultyCalculator,
        );
    }

    /**
     * Calculates the performance value of a beatmap.
     *
     * @param difficultyAttributes The difficulty attributes to calculate the performance value for.
     * @param calculationParams Calculation parameters.
     * @param difficultyCalculator The difficulty calculator that was used to calculate the beatmap.
     * @returns The result of the calculation.
     */
    private calculateRebalancePerformance(
        difficultyAttributes: RDA,
        calculationParams: PerformanceCalculationParameters,
        difficultyCalculator?: RDC,
    ): RebalancePerformanceCalculationResult<RDC, RPC> | null {
        calculationParams.applyFromAttributes(difficultyAttributes);

        const pp: RPC = new this.rebalancePerformanceCalculator(
            difficultyAttributes,
        ).calculate({
            combo: calculationParams.combo,
            accPercent: calculationParams.accuracy,
            tapPenalty: calculationParams.tapPenalty,
            aimSliderCheesePenalty:
                calculationParams.sliderCheesePenalty?.aimPenalty,
            flashlightSliderCheesePenalty:
                calculationParams.sliderCheesePenalty?.flashlightPenalty,
            visualSliderCheesePenalty:
                calculationParams.sliderCheesePenalty?.visualPenalty,
        });

        return new RebalancePerformanceCalculationResult(
            calculationParams,
            pp,
            difficultyCalculator,
        );
    }

    /**
     * Initializes a beatmap by downloading its file when needed.
     *
     * @param beatmap The beatmap.
     */
    private async initBeatmap(beatmap: MapInfo): Promise<void> {
        await beatmap.retrieveBeatmapFile();
    }
}
