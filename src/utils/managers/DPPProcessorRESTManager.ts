import { Config } from "@alice-core/Config";
import { RESTManager } from "./RESTManager";
import { Modes, RequestResponse } from "@rian8337/osu-base";
import { PPCalculationMethod } from "@alice-enums/utils/PPCalculationMethod";
import { CacheableDifficultyAttributes } from "@alice-structures/difficultyattributes/CacheableDifficultyAttributes";
import { RawDifficultyAttributes } from "@alice-structures/difficultyattributes/RawDifficultyAttributes";
import {
    DroidDifficultyAttributes,
    OsuDifficultyAttributes,
} from "@rian8337/osu-difficulty-calculator";
import {
    DroidDifficultyAttributes as RebalanceDroidDifficultyAttributes,
    OsuDifficultyAttributes as RebalanceOsuDifficultyAttributes,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import { consola } from "consola";
import { PPSubmissionStatus } from "@alice-structures/dpp/PPSubmissionStatus";
import { DifficultyCalculationParameters } from "@alice-utils/dpp/DifficultyCalculationParameters";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import { CompleteCalculationAttributes } from "@alice-structures/difficultyattributes/CompleteCalculationAttributes";
import { DroidPerformanceAttributes } from "@alice-structures/difficultyattributes/DroidPerformanceAttributes";
import { OsuPerformanceAttributes } from "@alice-structures/difficultyattributes/OsuPerformanceAttributes";
import { PerformanceAttributes } from "@alice-structures/difficultyattributes/PerformanceAttributes";

/**
 * A REST manager for the droid performance points processor backend.
 */
export abstract class DPPProcessorRESTManager extends RESTManager {
    private static readonly endpoint = Config.isDebug
        ? "https://droidpp.osudroid.moe/api/dpp/processor/"
        : "http://localhost:3006/api/dpp/processor/";

    /**
     * Retrieves a difficulty attributes from the backend.
     *
     * @param beatmapHash The MD5 hash of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculationParams The difficulty calculation parameters to use.
     * @returns The difficulty attributes, `null` if the difficulty attributes cannot be retrieved.
     */
    static async getDifficultyAttributes(
        beatmapHash: string,
        mode: Modes.droid,
        calculationMethod: PPCalculationMethod.live,
        calculationParams?: DifficultyCalculationParameters
    ): Promise<CacheableDifficultyAttributes<DroidDifficultyAttributes> | null>;

    /**
     * Retrieves a difficulty attributes from the backend.
     *
     * @param beatmapHash The MD5 hash of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculationParams The difficulty calculation parameters to use.
     * @returns The difficulty attributes, `null` if the difficulty attributes cannot be retrieved.
     */
    static async getDifficultyAttributes(
        beatmapHash: string,
        mode: Modes.droid,
        calculationMethod: PPCalculationMethod.rebalance,
        calculationParams?: DifficultyCalculationParameters
    ): Promise<CacheableDifficultyAttributes<RebalanceDroidDifficultyAttributes> | null>;

    /**
     * Retrieves a difficulty attributes from the backend.
     *
     * @param beatmapHash The MD5 hash of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculationParams The difficulty calculation parameters to use.
     * @returns The difficulty attributes, `null` if the difficulty attributes cannot be retrieved.
     */
    static async getDifficultyAttributes(
        beatmapHash: string,
        mode: Modes.osu,
        calculationMethod: PPCalculationMethod.live,
        calculationParams?: DifficultyCalculationParameters
    ): Promise<CacheableDifficultyAttributes<OsuDifficultyAttributes> | null>;

    /**
     * Retrieves a difficulty attributes from the backend.
     *
     * @param beatmapHash The MD5 hash of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculationParams The difficulty calculation parameters to use.
     * @returns The difficulty attributes, `null` if the difficulty attributes cannot be retrieved.
     */
    static async getDifficultyAttributes(
        beatmapHash: string,
        mode: Modes.osu,
        calculationMethod: PPCalculationMethod.rebalance,
        calculationParams?: DifficultyCalculationParameters
    ): Promise<CacheableDifficultyAttributes<RebalanceOsuDifficultyAttributes> | null>;

    static async getDifficultyAttributes(
        beatmapHash: string,
        mode: Modes,
        calculationMethod: PPCalculationMethod,
        calculationParams?: DifficultyCalculationParameters
    ): Promise<CacheableDifficultyAttributes<RawDifficultyAttributes> | null> {
        const url: URL = new URL(`${this.endpoint}get-difficulty-attributes`);
        url.searchParams.set("key", process.env.DROID_INTERNAL_SERVER_KEY!);
        url.searchParams.set("beatmaphash", beatmapHash);
        url.searchParams.set("mode", mode);
        url.searchParams.set("calculationmethod", calculationMethod.toString());

        if (calculationParams) {
            const { customStatistics } = calculationParams;

            if (customStatistics?.mods && customStatistics.mods.length > 0) {
                url.searchParams.set(
                    "mods",
                    customStatistics.mods.reduce((a, v) => a + v, "")
                );
            }

            if (customStatistics?.oldStatistics) {
                url.searchParams.set("oldstatistics", "1");
            }

            if (
                customStatistics?.speedMultiplier !== undefined &&
                customStatistics.speedMultiplier !== 1
            ) {
                url.searchParams.set(
                    "customspeedmultiplier",
                    customStatistics.speedMultiplier.toString()
                );
            }

            if (
                customStatistics?.isForceAR &&
                customStatistics.ar !== undefined
            ) {
                url.searchParams.set("forcear", customStatistics.ar.toString());
            }
        }

        const result: RequestResponse | null = await this.request(url).catch(
            () => null
        );

        if (result?.statusCode !== 200) {
            if (result) {
                const errorJson = JSON.parse(result.data.toString());

                consola.error(
                    "Request to %s failed with error: %s",
                    url.toString(),
                    errorJson.error
                );
            } else {
                consola.error(
                    "Request to %s failed with unknown error",
                    url.toString()
                );
            }

            return null;
        }

        return JSON.parse(result.data.toString("utf-8"));
    }

    /**
     * Retrieves a difficulty and performance attributes from the backend.
     *
     * @param beatmapHash The MD5 hash of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculationParams The performance calculation parameters to use.
     * @returns The performance attributes, `null` if the performance attributes cannot be retrieved.
     */
    static async getPerformanceAttributes(
        beatmapHash: string,
        mode: Modes.droid,
        calculationMethod: PPCalculationMethod.live,
        calculationParams?: PerformanceCalculationParameters
    ): Promise<CompleteCalculationAttributes<
        DroidDifficultyAttributes,
        DroidPerformanceAttributes
    > | null>;

    /**
     * Retrieves a performance attributes from the backend.
     *
     * @param beatmapHash The MD5 hash of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculationParams The performance calculation parameters to use.
     * @returns The performance attributes, `null` if the performance attributes cannot be retrieved.
     */
    static async getPerformanceAttributes(
        beatmapHash: string,
        mode: Modes.droid,
        calculationMethod: PPCalculationMethod.rebalance,
        calculationParams?: PerformanceCalculationParameters
    ): Promise<CompleteCalculationAttributes<
        RebalanceDroidDifficultyAttributes,
        DroidPerformanceAttributes
    > | null>;

    /**
     * Retrieves a performance attributes from the backend.
     *
     * @param beatmapHash The MD5 hash of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculationParams The performance calculation parameters to use.
     * @returns The performance attributes, `null` if the performance attributes cannot be retrieved.
     */
    static async getPerformanceAttributes(
        beatmapHash: string,
        mode: Modes.osu,
        calculationMethod: PPCalculationMethod.live,
        calculationParams?: PerformanceCalculationParameters
    ): Promise<CompleteCalculationAttributes<
        OsuDifficultyAttributes,
        OsuPerformanceAttributes
    > | null>;

    /**
     * Retrieves a performance attributes from the backend.
     *
     * @param beatmapHash The MD5 hash of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculationParams The performance calculation parameters to use.
     * @returns The performance attributes, `null` if the performance attributes cannot be retrieved.
     */
    static async getPerformanceAttributes(
        beatmapHash: string,
        mode: Modes.osu,
        calculationMethod: PPCalculationMethod.rebalance,
        calculationParams?: PerformanceCalculationParameters
    ): Promise<CompleteCalculationAttributes<
        RebalanceOsuDifficultyAttributes,
        OsuPerformanceAttributes
    > | null>;

    static async getPerformanceAttributes(
        beatmapHash: string,
        mode: Modes,
        calculationMethod: PPCalculationMethod,
        calculationParams?: PerformanceCalculationParameters
    ): Promise<CompleteCalculationAttributes<
        RawDifficultyAttributes,
        PerformanceAttributes
    > | null> {
        const url: URL = new URL(`${this.endpoint}get-performance-attributes`);
        url.searchParams.set("key", process.env.DROID_INTERNAL_SERVER_KEY!);
        url.searchParams.set("beatmaphash", beatmapHash);
        url.searchParams.set("mode", mode);
        url.searchParams.set("calculationmethod", calculationMethod.toString());

        if (calculationParams) {
            const { customStatistics } = calculationParams;

            if (customStatistics?.mods && customStatistics.mods.length > 0) {
                url.searchParams.set(
                    "mods",
                    customStatistics.mods.reduce((a, v) => a + v, "")
                );
            }

            if (customStatistics?.oldStatistics) {
                url.searchParams.set("oldstatistics", "1");
            }

            if (
                customStatistics?.speedMultiplier !== undefined &&
                customStatistics.speedMultiplier !== 1
            ) {
                url.searchParams.set(
                    "customspeedmultiplier",
                    customStatistics.speedMultiplier.toString()
                );
            }

            if (
                customStatistics?.isForceAR &&
                customStatistics.ar !== undefined
            ) {
                url.searchParams.set("forcear", customStatistics.ar.toString());
            }

            url.searchParams.set(
                "n300",
                calculationParams.accuracy.n300.toString()
            );
            url.searchParams.set(
                "n100",
                calculationParams.accuracy.n100.toString()
            );
            url.searchParams.set(
                "n50",
                calculationParams.accuracy.n50.toString()
            );
            url.searchParams.set(
                "nmiss",
                calculationParams.accuracy.nmiss.toString()
            );

            if (calculationParams.combo !== undefined) {
                url.searchParams.set(
                    "maxcombo",
                    calculationParams.combo.toString()
                );
            }
        }

        const result: RequestResponse | null = await this.request(url).catch(
            () => null
        );

        if (result?.statusCode !== 200) {
            if (result) {
                const errorJson = JSON.parse(result.data.toString());

                consola.error(
                    "Request to %s failed with error: %s",
                    url.toString(),
                    errorJson.error
                );
            } else {
                consola.error(
                    "Request to %s failed with unknown error",
                    url.toString()
                );
            }

            return null;
        }

        return JSON.parse(result.data.toString("utf-8"));
    }

    /**
     * Sends a score submission request to the backend.
     *
     * @param playerId The ID of the player of which the score belongs to.
     * @param scoreId The ID of the score.
     * @returns The status of the submission, `null` if the server fails to be reached.
     */
    static async submitScore(
        playerId: number,
        scoreId: number
    ): Promise<PPSubmissionStatus | null> {
        const url: URL = new URL(`${this.endpoint}submit-score`);
        const result: RequestResponse | null = await this.request(url, {
            body: {
                key: process.env.DROID_SERVER_INTERNAL_KEY,
                uid: playerId,
                scoreid: scoreId,
            },
        }).catch(() => null);

        if (result?.statusCode !== 200) {
            if (result) {
                const errorJson = JSON.parse(result.data.toString());

                consola.error(
                    "Request to %s failed with error: %s",
                    url.toString(),
                    errorJson.error
                );
            } else {
                consola.error(
                    "Request to %s failed with unknown error",
                    url.toString()
                );
            }

            return null;
        }

        return JSON.parse(result.data.toString("utf-8"));
    }
}
