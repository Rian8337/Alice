import { Config } from "@alice-core/Config";
import { RESTManager } from "./RESTManager";
import { ModUtil, Modes, RequestResponse } from "@rian8337/osu-base";
import { PPCalculationMethod } from "@alice-enums/utils/PPCalculationMethod";
import { RawDifficultyAttributes } from "@alice-structures/difficultyattributes/RawDifficultyAttributes";
import {
    CacheableDifficultyAttributes,
    DroidDifficultyAttributes,
    OsuDifficultyAttributes,
} from "@rian8337/osu-difficulty-calculator";
import {
    DroidDifficultyAttributes as RebalanceDroidDifficultyAttributes,
    OsuDifficultyAttributes as RebalanceOsuDifficultyAttributes,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import { consola } from "consola";
import { DifficultyCalculationParameters } from "@alice-utils/dpp/DifficultyCalculationParameters";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import { CompleteCalculationAttributes } from "@alice-structures/difficultyattributes/CompleteCalculationAttributes";
import { DroidPerformanceAttributes } from "@alice-structures/difficultyattributes/DroidPerformanceAttributes";
import { OsuPerformanceAttributes } from "@alice-structures/difficultyattributes/OsuPerformanceAttributes";
import { PerformanceAttributes } from "@alice-structures/difficultyattributes/PerformanceAttributes";
import { RebalanceDroidPerformanceAttributes } from "@alice-structures/difficultyattributes/RebalanceDroidPerformanceAttributes";
import { PPSubmissionOperationResult } from "@alice-structures/dpp/PPSubmissionOperationResult";

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
     * @param beatmapIdOrHash The MD5 hash or ID of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculationParams The difficulty calculation parameters to use.
     * @returns The difficulty attributes, `null` if the difficulty attributes cannot be retrieved.
     */
    static async getDifficultyAttributes(
        beatmapIdOrHash: string | number,
        mode: Modes.droid,
        calculationMethod: PPCalculationMethod.live,
        calculationParams?: DifficultyCalculationParameters,
    ): Promise<CacheableDifficultyAttributes<DroidDifficultyAttributes> | null>;

    /**
     * Retrieves a difficulty attributes from the backend.
     *
     * @param beatmapIdOrHash The MD5 hash or ID of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculationParams The difficulty calculation parameters to use.
     * @returns The difficulty attributes, `null` if the difficulty attributes cannot be retrieved.
     */
    static async getDifficultyAttributes(
        beatmapIdOrHash: string | number,
        mode: Modes.droid,
        calculationMethod: PPCalculationMethod.rebalance,
        calculationParams?: DifficultyCalculationParameters,
    ): Promise<CacheableDifficultyAttributes<RebalanceDroidDifficultyAttributes> | null>;

    /**
     * Retrieves a difficulty attributes from the backend.
     *
     * @param beatmapIdOrHash The MD5 hash or ID of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculationParams The difficulty calculation parameters to use.
     * @returns The difficulty attributes, `null` if the difficulty attributes cannot be retrieved.
     */
    static async getDifficultyAttributes(
        beatmapIdOrHash: string | number,
        mode: Modes.osu,
        calculationMethod: PPCalculationMethod.live,
        calculationParams?: DifficultyCalculationParameters,
    ): Promise<CacheableDifficultyAttributes<OsuDifficultyAttributes> | null>;

    /**
     * Retrieves a difficulty attributes from the backend.
     *
     * @param beatmapIdOrHash The MD5 hash or ID of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculationParams The difficulty calculation parameters to use.
     * @returns The difficulty attributes, `null` if the difficulty attributes cannot be retrieved.
     */
    static async getDifficultyAttributes(
        beatmapIdOrHash: string | number,
        mode: Modes.osu,
        calculationMethod: PPCalculationMethod.rebalance,
        calculationParams?: DifficultyCalculationParameters,
    ): Promise<CacheableDifficultyAttributes<RebalanceOsuDifficultyAttributes> | null>;

    static async getDifficultyAttributes(
        beatmapIdOrHash: string | number,
        mode: Modes,
        calculationMethod: PPCalculationMethod,
        calculationParams?: DifficultyCalculationParameters,
    ): Promise<CacheableDifficultyAttributes<RawDifficultyAttributes> | null> {
        const url = new URL(`${this.endpoint}get-difficulty-attributes`);

        url.searchParams.set("key", process.env.DROID_SERVER_INTERNAL_KEY!);
        url.searchParams.set("gamemode", mode);
        url.searchParams.set("calculationmethod", calculationMethod.toString());
        url.searchParams.set(
            typeof beatmapIdOrHash === "number" ? "beatmapid" : "beatmaphash",
            beatmapIdOrHash.toString(),
        );

        if (calculationParams) {
            if (calculationParams.mods && calculationParams.mods.length > 0) {
                url.searchParams.set(
                    "mods",
                    ModUtil.modsToOsuString(calculationParams.mods),
                );
            }

            if (calculationParams.oldStatistics) {
                url.searchParams.set("oldstatistics", "1");
            }

            if (
                calculationParams.customSpeedMultiplier !== undefined &&
                calculationParams.customSpeedMultiplier !== 1
            ) {
                url.searchParams.set(
                    "customspeedmultiplier",
                    calculationParams.customSpeedMultiplier.toString(),
                );
            }

            if (calculationParams.forceCS !== undefined) {
                url.searchParams.set(
                    "forcecs",
                    calculationParams.forceCS.toString(),
                );
            }

            if (calculationParams.forceAR !== undefined) {
                url.searchParams.set(
                    "forcear",
                    calculationParams.forceAR.toString(),
                );
            }

            if (calculationParams.forceOD !== undefined) {
                url.searchParams.set(
                    "forceod",
                    calculationParams.forceOD.toString(),
                );
            }

            if (calculationParams.forceHP !== undefined) {
                url.searchParams.set(
                    "forcehp",
                    calculationParams.forceHP.toString(),
                );
            }
        }

        const result = await this.request(url).catch(() => null);

        if (result?.statusCode !== 200) {
            this.logError(url, result);

            return null;
        }

        return JSON.parse(result.data.toString("utf-8"));
    }

    /**
     * Retrieves a difficulty and performance attributes from the backend.
     *
     * @param beatmapIdOrHash The MD5 hash or ID of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculationParams The performance calculation parameters to use.
     * @returns The difficulty and performance attributes, `null` if the attributes cannot be retrieved.
     */
    static async getPerformanceAttributes(
        beatmapIdOrHash: string | number,
        mode: Modes.droid,
        calculationMethod: PPCalculationMethod.live,
        calculationParams?: PerformanceCalculationParameters,
    ): Promise<CompleteCalculationAttributes<
        DroidDifficultyAttributes,
        DroidPerformanceAttributes
    > | null>;

    /**
     * Retrieves a difficulty and performance attributes from the backend.
     *
     * @param beatmapIdOrHash The MD5 hash or ID of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculationParams The performance calculation parameters to use.
     * @returns The difficulty and performance attributes, `null` if the attributes cannot be retrieved.
     */
    static async getPerformanceAttributes(
        beatmapIdOrHash: string | number,
        mode: Modes.droid,
        calculationMethod: PPCalculationMethod.rebalance,
        calculationParams?: PerformanceCalculationParameters,
    ): Promise<CompleteCalculationAttributes<
        RebalanceDroidDifficultyAttributes,
        RebalanceDroidPerformanceAttributes
    > | null>;

    /**
     * Retrieves a difficulty and performance attributes from the backend.
     *
     * @param beatmapIdOrHash The MD5 hash or ID of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculationParams The performance calculation parameters to use.
     * @returns The difficulty and performance attributes, `null` if the attributes cannot be retrieved.
     */
    static async getPerformanceAttributes(
        beatmapIdOrHash: string | number,
        mode: Modes.osu,
        calculationMethod: PPCalculationMethod.live,
        calculationParams?: PerformanceCalculationParameters,
    ): Promise<CompleteCalculationAttributes<
        OsuDifficultyAttributes,
        OsuPerformanceAttributes
    > | null>;

    /**
     * Retrieves a difficulty and performance attributes from the backend.
     *
     * @param beatmapIdOrHash The MD5 hash or ID of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculationParams The performance calculation parameters to use.
     * @returns The difficulty and performance attributes, `null` if the attributes cannot be retrieved.
     */
    static async getPerformanceAttributes(
        beatmapIdOrHash: string | number,
        mode: Modes.osu,
        calculationMethod: PPCalculationMethod.rebalance,
        calculationParams?: PerformanceCalculationParameters,
    ): Promise<CompleteCalculationAttributes<
        RebalanceOsuDifficultyAttributes,
        OsuPerformanceAttributes
    > | null>;

    static async getPerformanceAttributes(
        beatmapIdOrHash: string | number,
        mode: Modes,
        calculationMethod: PPCalculationMethod,
        calculationParams?: PerformanceCalculationParameters,
    ): Promise<CompleteCalculationAttributes<
        RawDifficultyAttributes,
        PerformanceAttributes
    > | null> {
        const url = new URL(`${this.endpoint}get-performance-attributes`);

        url.searchParams.set("key", process.env.DROID_SERVER_INTERNAL_KEY!);
        url.searchParams.set("gamemode", mode);
        url.searchParams.set("calculationmethod", calculationMethod.toString());
        url.searchParams.set(
            typeof beatmapIdOrHash === "number" ? "beatmapid" : "beatmaphash",
            beatmapIdOrHash.toString(),
        );

        if (calculationParams) {
            if (calculationParams.mods && calculationParams.mods.length > 0) {
                url.searchParams.set(
                    "mods",
                    ModUtil.modsToOsuString(calculationParams.mods),
                );
            }

            if (calculationParams.oldStatistics) {
                url.searchParams.set("oldstatistics", "1");
            }

            if (
                calculationParams.customSpeedMultiplier !== undefined &&
                calculationParams.customSpeedMultiplier !== 1
            ) {
                url.searchParams.set(
                    "customspeedmultiplier",
                    calculationParams.customSpeedMultiplier.toString(),
                );
            }

            if (calculationParams.forceCS !== undefined) {
                url.searchParams.set(
                    "forcecs",
                    calculationParams.forceCS.toString(),
                );
            }

            if (calculationParams.forceAR !== undefined) {
                url.searchParams.set(
                    "forcear",
                    calculationParams.forceAR.toString(),
                );
            }

            if (calculationParams.forceOD !== undefined) {
                url.searchParams.set(
                    "forceod",
                    calculationParams.forceOD.toString(),
                );
            }

            url.searchParams.set(
                "n300",
                calculationParams.accuracy.n300.toString(),
            );
            url.searchParams.set(
                "n100",
                calculationParams.accuracy.n100.toString(),
            );
            url.searchParams.set(
                "n50",
                calculationParams.accuracy.n50.toString(),
            );
            url.searchParams.set(
                "nmiss",
                calculationParams.accuracy.nmiss.toString(),
            );

            if (calculationParams.combo !== undefined) {
                url.searchParams.set(
                    "maxcombo",
                    calculationParams.combo.toString(),
                );
            }
        }

        const result = await this.request(url).catch(() => null);

        if (result?.statusCode !== 200) {
            this.logError(url, result);

            return null;
        }

        return JSON.parse(result.data.toString("utf-8"));
    }

    /**
     * Gets the difficulty and performance attributes of a score.
     *
     * @param scoreId The ID of the score.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @returns The difficulty and performance attributes, `null` if the attributes cannot be retrieved.
     */
    static async getOnlineScoreAttributes(
        scoreId: number,
        mode: Modes.droid,
        calculationMethod: PPCalculationMethod.live,
    ): Promise<CompleteCalculationAttributes<
        DroidDifficultyAttributes,
        DroidPerformanceAttributes
    > | null>;

    /**
     * Gets the difficulty and performance attributes of a score.
     *
     * @param scoreId The ID of the score.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @returns The difficulty and performance attributes, `null` if the attributes cannot be retrieved.
     */
    static async getOnlineScoreAttributes(
        scoreId: number,
        mode: Modes.droid,
        calculationMethod: PPCalculationMethod.rebalance,
    ): Promise<CompleteCalculationAttributes<
        RebalanceDroidDifficultyAttributes,
        RebalanceDroidPerformanceAttributes
    > | null>;

    /**
     * Gets the difficulty and performance attributes of a score.
     *
     * @param scoreId The ID of the score.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @returns The difficulty and performance attributes, `null` if the attributes cannot be retrieved.
     */
    static async getOnlineScoreAttributes(
        scoreId: number,
        mode: Modes.osu,
        calculationMethod: PPCalculationMethod.live,
    ): Promise<CompleteCalculationAttributes<
        OsuDifficultyAttributes,
        OsuPerformanceAttributes
    > | null>;

    /**
     * Gets the difficulty and performance attributes of a score.
     *
     * @param scoreId The ID of the score.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @returns The difficulty and performance attributes, `null` if the attributes cannot be retrieved.
     */
    static async getOnlineScoreAttributes(
        scoreId: number,
        mode: Modes.osu,
        calculationMethod: PPCalculationMethod.rebalance,
    ): Promise<CompleteCalculationAttributes<
        RebalanceOsuDifficultyAttributes,
        OsuPerformanceAttributes
    > | null>;

    static async getOnlineScoreAttributes(
        scoreId: number,
        mode: Modes,
        calculationMethod: PPCalculationMethod,
    ): Promise<CompleteCalculationAttributes<
        RawDifficultyAttributes,
        PerformanceAttributes
    > | null> {
        const url = new URL(`${this.endpoint}get-online-score-attributes`);

        url.searchParams.set("key", process.env.DROID_SERVER_INTERNAL_KEY!);
        url.searchParams.set("scoreid", scoreId.toString());
        url.searchParams.set("gamemode", mode);
        url.searchParams.set("calculationmethod", calculationMethod.toString());

        const result = await this.request(url).catch(() => null);

        if (result?.statusCode !== 200) {
            this.logError(url, result);

            return null;
        }

        return JSON.parse(result.data.toString("utf-8"));
    }

    /**
     * Get the best performance of a player in a beatmap.
     *
     * @param playerId The ID of the player.
     * @param beatmapHash The MD5 hash of the beatmap.
     * @param calculationMethod The calculation method to use.
     * @returns The difficulty and performance attributes representing the best difficulty and performance
     * of the player's score in the beatmap, `null` if the attributes cannot be retrieved.
     */
    static async getBestScorePerformance(
        playerId: number,
        beatmapHash: string,
        calculationMethod: PPCalculationMethod.live,
    ): Promise<CompleteCalculationAttributes<
        DroidDifficultyAttributes,
        DroidPerformanceAttributes
    > | null>;

    /**
     * Get the best performance of a player in a beatmap.
     *
     * @param playerId The ID of the player.
     * @param beatmapHash The MD5 hash of the beatmap.
     * @param calculationMethod The calculation method to use.
     * @returns The difficulty and performance attributes representing the best difficulty and performance
     * of the player's score in the beatmap, `null` if the attributes cannot be retrieved.
     */
    static async getBestScorePerformance(
        playerId: number,
        beatmapHash: string,
        calculationMethod: PPCalculationMethod.rebalance,
    ): Promise<CompleteCalculationAttributes<
        RebalanceDroidDifficultyAttributes,
        RebalanceDroidPerformanceAttributes
    > | null>;

    static async getBestScorePerformance(
        playerId: number,
        beatmapHash: string,
        calculationMethod: PPCalculationMethod,
    ): Promise<CompleteCalculationAttributes<
        RawDifficultyAttributes,
        DroidPerformanceAttributes
    > | null> {
        const url = new URL(
            `${this.endpoint}get-player-best-score-performance`,
        );

        url.searchParams.set("key", process.env.DROID_SERVER_INTERNAL_KEY!);
        url.searchParams.set("playerid", playerId.toString());
        url.searchParams.set("beatmaphash", beatmapHash);
        url.searchParams.set("calculationmethod", calculationMethod.toString());

        const result = await this.request(url).catch(() => null);

        if (result?.statusCode !== 200) {
            this.logError(url, result);

            return null;
        }

        return JSON.parse(result.data.toString("utf-8"));
    }

    /**
     * Sends a score submission request to the backend.
     *
     * @param playerId The ID of the player of which the score belongs to.
     * @param scoreIds The ID of the scores to be submitted.
     * @returns The status of the submission for each score ID, `null` if the server fails to be reached.
     */
    static async submitScores(
        playerId: number,
        scoreIds: number[],
    ): Promise<PPSubmissionOperationResult | null> {
        const url = new URL(`${this.endpoint}submit-scores`);
        const result = await this.request(url, {
            method: "POST",
            body: {
                key: process.env.DROID_SERVER_INTERNAL_KEY,
                uid: playerId,
                scoreids: scoreIds.join(","),
            },
            json: true,
        }).catch(() => null);

        if (result?.statusCode !== 200) {
            this.logError(url, result);

            return null;
        }

        return JSON.parse(result.data.toString("utf-8"));
    }

    /**
     * Persists a local replay file of a player.
     *
     * @param playerId The ID of the player.
     * @param beatmapHash The MD5 hash of the beatmap where the replay resides.
     * @param replayHash The MD5 hash of the replay file.
     * @returns Whether the replay file was successfully persisted.
     */
    static async persistLocalReplay(
        playerId: number,
        beatmapHash: string,
        replayHash: string,
    ): Promise<boolean> {
        const url = new URL(`${this.endpoint}persist-local-replay`);
        const result = await this.request(url, {
            method: "PUT",
            body: {
                key: process.env.DROID_SERVER_INTERNAL_KEY,
                playerid: playerId,
                beatmaphash: beatmapHash,
                replayhash: replayHash,
            },
            json: true,
        });

        if (result?.statusCode !== 200) {
            if (result) {
                consola.error(
                    "Request to %s failed with error: %s",
                    url
                        .toString()
                        .replace(process.env.DROID_SERVER_INTERNAL_KEY!, ""),
                    result.data.toString("utf-8"),
                );
            } else {
                consola.error(
                    "Request to %s failed with unknown error",
                    url
                        .toString()
                        .replace(process.env.DROID_SERVER_INTERNAL_KEY!, ""),
                );
            }

            return false;
        }

        return true;
    }

    /**
     * Persists an online replay file of a player.
     *
     * @param playerId The ID of the player.
     * @param scoreId The ID of the score.
     * @returns Whether the replay file was successfully persisted.
     */
    static async persistOnlineReplay(
        playerId: number,
        scoreId: number,
    ): Promise<boolean> {
        const url = new URL(`${this.endpoint}persist-online-replay`);
        const result = await this.request(url, {
            method: "PUT",
            body: {
                key: process.env.DROID_SERVER_INTERNAL_KEY,
                uid: playerId,
                scoreid: scoreId,
            },
            json: true,
        });

        if (result?.statusCode !== 200) {
            this.logError(url, result);

            return false;
        }

        return true;
    }

    /**
     * Logs the error of a request.
     *
     * @param url The URL the request was directed to.
     * @param result The request result.
     */
    private static logError(url: URL, result: RequestResponse | null): void {
        if (result) {
            consola.error(
                "Request to %s failed with error: %s",
                url
                    .toString()
                    .replace(process.env.DROID_SERVER_INTERNAL_KEY!, ""),
                result.data.toString("utf-8"),
            );
        } else {
            consola.error(
                "Request to %s failed with unknown error",
                url
                    .toString()
                    .replace(process.env.DROID_SERVER_INTERNAL_KEY!, ""),
            );
        }
    }
}
