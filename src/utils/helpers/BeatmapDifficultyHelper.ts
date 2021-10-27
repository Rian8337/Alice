import { Accuracy, DroidPerformanceCalculator, MapInfo, MapStars, MapStats, Mod, ModUtil, OsuPerformanceCalculator, ReplayAnalyzer, Score } from "osu-droid";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { StarRatingCalculationResult } from "@alice-utils/dpp/StarRatingCalculationResult";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import { StarRatingCalculationParameters } from "@alice-utils/dpp/StarRatingCalculationParameters";

/**
 * A helper to calculate difficulty and performance of beatmaps or scores.
 */
export abstract class BeatmapDifficultyHelper {
    /**
     * Gets calculation parameters from a user's message.
     * 
     * @param message The user's message.
     * @returns The calculation parameters from the user's message.
     */
    static getCalculationParamsFromMessage(message: string): PerformanceCalculationParameters {
        let mods: Mod[] = [];
        let combo: number | undefined;
        let forceAR: number | undefined;
        let speedMultiplier: number = 1;
        let accPercent: number = 100;
        let countMiss: number = 0;
        let count100: number = 0;
        let count50: number = 0;

        for (const input of message.split(/\s+/g)) {
            if (input.endsWith("%")) {
                const newAccPercent = parseFloat(input);
                accPercent = Math.max(0, Math.min(newAccPercent || 0, 100));
            }
            if (input.endsWith("m")) {
                const newCountMiss = parseInt(input);
                countMiss = Math.max(0, newCountMiss || 0);
            }
            if (input.endsWith("x")) {
                if (input.includes(".")) {
                    speedMultiplier = Math.max(0.5, Math.min(2, parseFloat(parseFloat(input).toFixed(2)) || 1));
                } else {
                    const newCombo = parseInt(input);
                    combo = Math.max(0, newCombo || 0);
                }
            }
            if (input.startsWith("+")) {
                mods.push(...ModUtil.pcStringToMods(input.replace("+", "")));
            }
            if (input.startsWith("AR")) {
                forceAR = Math.max(0, Math.min(12.5, parseFloat(parseFloat(input.substring(2)).toFixed(2)) || 0));
            }
            if (input.endsWith("x50")) {
                count50 = Math.max(0, parseInt(input) || 0);
            }
            if (input.endsWith("x100")) {
                count100 = Math.max(0, parseInt(input) || 0);
            }
        }

        const stats: MapStats = new MapStats({
            ar: forceAR,
            speedMultiplier: speedMultiplier,
            isForceAR: !isNaN(<number> forceAR)
        });

        return new PerformanceCalculationParameters(
            mods,
            new Accuracy({
                n100: count100,
                n50: count50,
                nmiss: countMiss
            }),
            accPercent,
            combo,
            1,
            stats
        );
    }

    /**
     * Gets calculation parameters from a score.
     * 
     * @param score The score.
     * @param useReplay Whether to use replay in the calculation. Defaults to `true`.
     * @returns Calculation parameters of the score.
     */
    static async getCalculationParamsFromScore(score: Score, useReplay: boolean = true): Promise<PerformanceCalculationParameters> {
        if (!score.replay && useReplay) {
            await score.downloadReplay();
        }

        const stats: MapStats = new MapStats({
            ar: score.forcedAR,
            speedMultiplier: score.speedMultiplier,
            isForceAR: !isNaN(score.forcedAR!),
            oldStatistics: (score.replay?.data?.replayVersion ?? 4) <= 3
        });

        return new PerformanceCalculationParameters(
            score.mods,
            score.accuracy,
            score.accuracy.value() * 100,
            score.combo,
            1,
            stats
        );
    }

    /**
     * Calculates the difficulty and performance value of a score.
     * 
     * @param score The score.
     * @param useReplay Whether to use replay in the calculation. Defaults to `true`.
     * @param calcParams Calculation parameters to override the score's default calculation parameters.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    static async calculateScorePerformance(score: Score, useReplay: boolean = true, calcParams?: PerformanceCalculationParameters): Promise<PerformanceCalculationResult | null> {
        const beatmap: MapInfo | null = await BeatmapManager.getBeatmap(score.hash);

        if (!beatmap) {
            return null;
        }

        if (!score.replay && useReplay) {
            await score.downloadReplay();
        }

        calcParams ??= await this.getCalculationParamsFromScore(score, useReplay);

        return this.calculatePerformance(beatmap, calcParams, useReplay ? score.replay : undefined);
    }

    /**
     * Calculates the difficulty and performance value of a beatmap.
     * 
     * @param beatmapIDorHash The ID or MD5 hash of the beatmap.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @param replay The replay to use in calculation, used for calculating a replay's performance.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    static async calculateBeatmapPerformance(beatmapIDorHash: number | string, calculationParams?: PerformanceCalculationParameters, replay?: ReplayAnalyzer): Promise<PerformanceCalculationResult | null> {
        const beatmap: MapInfo | null = await BeatmapManager.getBeatmap(beatmapIDorHash);

        if (!beatmap) {
            return null;
        }

        calculationParams ??= new PerformanceCalculationParameters(
            [],
            new Accuracy({
                n300: beatmap.objects
            }),
            100,
            beatmap.maxCombo
        );

        return this.calculatePerformance(beatmap, calculationParams, replay);
    }

    /**
     * Calculates the difficulty of the beatmap being played in a score.
     * 
     * @param score The score to calculate.
     * @returns The calculation result.
     */
    static async calculateScoreDifficulty(score: Score): Promise<StarRatingCalculationResult | null> {
        const beatmap: MapInfo | null = await BeatmapManager.getBeatmap(score.hash);

        if (!beatmap) {
            return null;
        }

        return this.calculateDifficulty(
            beatmap,
            await this.getCalculationParamsFromScore(score, false)
        );
    }

    /**
     * Calculates the difficulty of a beatmap.
     * 
     * @param beatmapIDorHash The ID or MD5 hash of the beatmap.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    static async calculateBeatmapDifficulty(beatmapIDorHash: number | string, calculationParams: StarRatingCalculationParameters): Promise<StarRatingCalculationResult | null> {
        const beatmap: MapInfo | null = await BeatmapManager.getBeatmap(beatmapIDorHash);

        if (!beatmap) {
            return null;
        }

        return this.calculateDifficulty(beatmap, calculationParams);
    }

    /**
     * Calculates the difficulty of a beatmap.
     * 
     * @param beatmap The beatmap to calculate.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    private static calculateDifficulty(beatmap: MapInfo, calculationParams: StarRatingCalculationParameters): StarRatingCalculationResult {
        calculationParams.applyFromBeatmap(beatmap);

        const star: MapStars = new MapStars().calculate({
            map: beatmap.map!,
            mods: calculationParams.mods,
            stats: calculationParams.customStatistics
        });

        return new StarRatingCalculationResult(beatmap, star.droidStars, star.pcStars);
    }

    /**
     * Calculates the performance value of a beatmap.
     * 
     * @param beatmap The beatmap.
     * @param calculationParams Calculation parameters.
     * @param replay The replay of the score in the beatmap, if available. This will be used to analyze if the score uses 3 finger abuse.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    private static calculatePerformance(beatmap: MapInfo, calculationParams: PerformanceCalculationParameters, replay?: ReplayAnalyzer): PerformanceCalculationResult {
        calculationParams.applyFromBeatmap(beatmap);

        const star: StarRatingCalculationResult = this.calculateDifficulty(beatmap, calculationParams);

        if (replay) {
            replay.map = star.droid;
            replay.checkFor3Finger();
            calculationParams.tapPenalty = replay.tapPenalty;
        }

        const dpp: DroidPerformanceCalculator = new DroidPerformanceCalculator().calculate({
            stars: star.droid,
            combo: calculationParams.combo,
            accPercent: calculationParams.accuracy,
            tapPenalty: calculationParams.tapPenalty,
            stats: calculationParams.customStatistics
        });

        const pp: OsuPerformanceCalculator = new OsuPerformanceCalculator().calculate({
            stars: star.osu,
            combo: calculationParams.combo,
            accPercent: calculationParams.accuracy,
            stats: calculationParams.customStatistics
        });

        return new PerformanceCalculationResult(beatmap, dpp, pp, replay);
    }
}