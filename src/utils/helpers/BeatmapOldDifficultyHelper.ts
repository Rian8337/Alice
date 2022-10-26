import {
    Accuracy,
    Beatmap,
    Circle,
    MapInfo,
    MapStats,
    Mod,
    Modes,
    ModTouchDevice,
    ModUtil,
    Slider,
} from "@rian8337/osu-base";
import { Score } from "@rian8337/osu-droid-utilities";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import { DifficultyCalculationParameters } from "@alice-utils/dpp/DifficultyCalculationParameters";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { OldDifficultyCalculationResult } from "@alice-utils/dpp/OldDifficultyCalculationResult";
import { OldPerformanceCalculationResult } from "@alice-utils/dpp/OldPerformanceCalculationResult";
import {
    beatmap as OldBeatmap,
    circle,
    diff,
    hitobject,
    modbits,
    objtypes,
    ppv2,
    slider,
    std_diff,
    std_ppv2,
    timing,
} from "ojsamadroid";

/**
 * A helper class for calculating old difficulty and performance of beatmaps or scores.
 */
export abstract class BeatmapOldDifficultyHelper {
    /**
     * Gets calculation parameters from a user's message.
     *
     * @param message The user's message.
     * @returns The calculation parameters from the user's message.
     */
    static getCalculationParamsFromMessage(
        message: string
    ): PerformanceCalculationParameters {
        const mods: Mod[] = [];
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
                    speedMultiplier = Math.max(
                        0.5,
                        Math.min(
                            2,
                            parseFloat(parseFloat(input).toFixed(2)) || 1
                        )
                    );
                } else {
                    const newCombo = parseInt(input);
                    combo = Math.max(0, newCombo || 0);
                }
            }
            if (input.startsWith("+")) {
                mods.push(...ModUtil.pcStringToMods(input.replace("+", "")));
            }
            if (input.startsWith("AR")) {
                forceAR = Math.max(
                    0,
                    Math.min(
                        12.5,
                        parseFloat(parseFloat(input.substring(2)).toFixed(2)) ||
                            0
                    )
                );
            }
            if (input.endsWith("x50")) {
                count50 = Math.max(0, parseInt(input) || 0);
            }
            if (input.endsWith("x100")) {
                count100 = Math.max(0, parseInt(input) || 0);
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
            1,
            new MapStats({
                mods: mods,
                ar: forceAR,
                speedMultiplier: speedMultiplier,
                isForceAR: !isNaN(forceAR!),
            })
        );
    }

    /**
     * Gets calculation parameters from a score.
     *
     * @param score The score.
     * @returns Calculation parameters of the score.
     */
    static getCalculationParamsFromScore(
        score: Score
    ): PerformanceCalculationParameters {
        return new PerformanceCalculationParameters(
            score.accuracy,
            score.accuracy.value() * 100,
            score.combo,
            1,
            new MapStats({
                mods: score.mods,
                ar: score.forcedAR,
                speedMultiplier: score.speedMultiplier,
                isForceAR: !isNaN(score.forcedAR!),
                oldStatistics: true,
            })
        );
    }

    /**
     * Calculates the difficulty and performance value of a score.
     *
     * @param score The score.
     * @param calcParams Calculation parameters to override the score's default calculation parameters.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    static async calculateScorePerformance(
        score: Score,
        calcParams?: PerformanceCalculationParameters
    ): Promise<OldPerformanceCalculationResult | null> {
        const beatmap: MapInfo<true> | null = await BeatmapManager.getBeatmap(
            score.hash
        );

        if (!beatmap) {
            return null;
        }

        calcParams ??=
            BeatmapOldDifficultyHelper.getCalculationParamsFromScore(score);

        const result: OldDifficultyCalculationResult | null =
            await this.calculateDifficulty(beatmap, calcParams);

        if (!result) {
            return null;
        }

        return this.calculatePerformance(result, calcParams);
    }

    /**
     * Calculates the difficulty and/or performance value of a beatmap.
     *
     * @param beatmap The beatmap to calculate.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    static async calculateBeatmapPerformance(
        beatmap: MapInfo,
        calculationParams?: PerformanceCalculationParameters
    ): Promise<OldPerformanceCalculationResult | null>;

    /**
     * Calculates the difficulty and/or performance value of a beatmap.
     *
     * @param star The result of difficulty calculation.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    static async calculateBeatmapPerformance(
        star: OldDifficultyCalculationResult,
        calculationParams?: PerformanceCalculationParameters
    ): Promise<OldPerformanceCalculationResult | null>;

    /**
     * Calculates the difficulty and/or performance value of a beatmap.
     *
     * @param beatmapIdOrHash The ID or MD5 hash of the beatmap.
     * @param calculationParams Calculation parameters. If unspecified, will calculate for No Mod SS.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    static async calculateBeatmapPerformance(
        beatmapIdOrHash: number | string,
        calculationParams?: PerformanceCalculationParameters
    ): Promise<OldPerformanceCalculationResult | null>;

    static async calculateBeatmapPerformance(
        beatmapOrHashOrStar:
            | MapInfo
            | number
            | string
            | OldDifficultyCalculationResult,
        calculationParams?: PerformanceCalculationParameters
    ): Promise<OldPerformanceCalculationResult | null> {
        let beatmap: MapInfo<true> | null;

        if (beatmapOrHashOrStar instanceof MapInfo) {
            beatmap = beatmapOrHashOrStar;
        } else if (
            beatmapOrHashOrStar instanceof OldDifficultyCalculationResult
        ) {
            beatmap = beatmapOrHashOrStar.map;
        } else {
            beatmap = await BeatmapManager.getBeatmap(beatmapOrHashOrStar);
        }

        if (!beatmap) {
            return null;
        }

        calculationParams ??= new PerformanceCalculationParameters(
            new Accuracy({
                n300: beatmap.objects,
            }),
            100,
            beatmap.maxCombo
        );

        const star: OldDifficultyCalculationResult | null =
            beatmapOrHashOrStar instanceof OldDifficultyCalculationResult
                ? beatmapOrHashOrStar
                : await this.calculateDifficulty(beatmap, calculationParams);

        if (!star) {
            return null;
        }

        return this.calculatePerformance(star, calculationParams);
    }

    /**
     * Calculates the difficulty of the beatmap being played in a score.
     *
     * @param score The score to calculate.
     * @returns The calculation result.
     */
    static async calculateScoreDifficulty(
        score: Score
    ): Promise<OldDifficultyCalculationResult | null> {
        const beatmap: MapInfo<true> | null = await BeatmapManager.getBeatmap(
            score.hash
        );

        if (!beatmap) {
            return null;
        }

        return this.calculateDifficulty(
            beatmap,
            BeatmapOldDifficultyHelper.getCalculationParamsFromScore(score)
        );
    }

    /**
     * Calculates the difficulty of a beatmap.
     *
     * @param beatmap The beatmap.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    static async calculateBeatmapDifficulty(
        beatmap: MapInfo,
        calculationParams: DifficultyCalculationParameters
    ): Promise<OldDifficultyCalculationResult | null>;

    /**
     * Calculates the difficulty of a beatmap.
     *
     * @param beatmapIdOrHash The ID or MD5 hash of the beatmap.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    static async calculateBeatmapDifficulty(
        beatmapIdOrHash: number | string,
        calculationParams: DifficultyCalculationParameters
    ): Promise<OldDifficultyCalculationResult | null>;

    static async calculateBeatmapDifficulty(
        beatmapOrIdOrHash: MapInfo | number | string,
        calculationParams: DifficultyCalculationParameters
    ): Promise<OldDifficultyCalculationResult | null> {
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
     * Calculates the difficulty of a beatmap.
     *
     * @param beatmap The beatmap to calculate.
     * @param calculationParams Calculation parameters.
     * @returns The calculation result.
     */
    private static async calculateDifficulty(
        beatmap: MapInfo,
        calculationParams: DifficultyCalculationParameters
    ): Promise<OldDifficultyCalculationResult | null> {
        await this.initBeatmap(beatmap);

        if (
            !beatmap.hasDownloadedBeatmap() ||
            beatmap.beatmap.hitObjects.objects.length === 0
        ) {
            return null;
        }

        const oldBeatmap: OldBeatmap = this.convertBeatmap(beatmap.beatmap);

        // Calculate stats manually as ojsama has been modified to not do so by itself.
        const stats: MapStats = new MapStats({
            ...calculationParams.customStatistics,
            cs: oldBeatmap.cs,
            ar: calculationParams.customStatistics?.isForceAR
                ? calculationParams.customStatistics?.ar
                : oldBeatmap.ar,
            od: oldBeatmap.od,
            hp: oldBeatmap.hp,
        }).calculate({ mode: Modes.droid });

        oldBeatmap.cs = stats.cs!;
        oldBeatmap.ar = stats.ar!;
        oldBeatmap.od = stats.od!;
        oldBeatmap.hp = stats.hp!;

        const star: std_diff = new diff().calc({
            map: oldBeatmap,
            mods: modbits.from_string(new ModTouchDevice().acronym),
            speed_mul: stats.speedMultiplier,
        });

        return new OldDifficultyCalculationResult(beatmap, star);
    }

    /**
     * Calculates the performance value of a beatmap.
     *
     * @param star The result of difficulty calculation.
     * @param calculationParams Calculation parameters.
     * @returns The result of the calculation, `null` if the beatmap is not found.
     */
    private static calculatePerformance(
        star: OldDifficultyCalculationResult,
        calculationParams: PerformanceCalculationParameters
    ): OldPerformanceCalculationResult | null {
        if (star.map.objects === 0) {
            return null;
        }

        calculationParams.applyFromBeatmap(star.map);

        const pp: std_ppv2 = ppv2({
            stars: star.result,
            combo: calculationParams.combo,
            max_combo: star.map.maxCombo,
            n300: calculationParams.accuracy.n300,
            n100: calculationParams.accuracy.n100,
            n50: calculationParams.accuracy.n50,
            nmiss: calculationParams.accuracy.nmiss,
        });

        return new OldPerformanceCalculationResult(star.map, star.result, pp);
    }

    /**
     * Initializes a beatmap by downloading its file when needed.
     *
     * @param beatmap The beatmap.
     */
    private static async initBeatmap(beatmap: MapInfo): Promise<void> {
        await beatmap.retrieveBeatmapFile();
    }

    /**
     * Converts a beatmap into ojsamadroid's beatmap.
     *
     * Keep in mind that this function only converts the data necessary for
     * difficulty and performance calculation.
     *
     * @param beatmap The beatmap to convert.
     * @returns The converted beatmap.
     */
    private static convertBeatmap(beatmap: Beatmap): OldBeatmap {
        const oldBeatmap: OldBeatmap = new OldBeatmap();

        oldBeatmap.format_version = beatmap.formatVersion;

        oldBeatmap.cs = beatmap.difficulty.cs;
        oldBeatmap.ar = beatmap.difficulty.ar;
        oldBeatmap.od = beatmap.difficulty.od;
        oldBeatmap.hp = beatmap.difficulty.hp;
        oldBeatmap.sv = beatmap.difficulty.sliderMultiplier;
        oldBeatmap.tick_rate = beatmap.difficulty.sliderTickRate;

        for (const controlPoint of beatmap.controlPoints.timing.points) {
            oldBeatmap.timing_points.push(
                new timing({
                    time: controlPoint.time,
                    ms_per_beat: controlPoint.msPerBeat,
                })
            );
        }

        for (const object of beatmap.hitObjects.objects) {
            const oldObject: hitobject = new hitobject({
                time: object.startTime,
                type: <objtypes>(<unknown>object.type),
            });

            oldBeatmap.objects.push(oldObject);

            if (object instanceof Circle) {
                oldObject.data = new circle({
                    pos: [object.position.x, object.position.y],
                });

                ++oldBeatmap.ncircles;
            } else if (object instanceof Slider) {
                oldObject.data = new slider({
                    pos: [object.position.x, object.position.y],
                    distance: object.path.expectedDistance,
                    repetitions: object.repeats + 1,
                });

                ++oldBeatmap.nsliders;
            } else {
                ++oldBeatmap.nspinners;
            }
        }

        return oldBeatmap;
    }
}
