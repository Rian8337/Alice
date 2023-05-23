import { Config } from "@alice-core/Config";
import { RESTManager } from "./RESTManager";
import {
    IModApplicableToDroid,
    IModApplicableToOsu,
    Mod,
    Modes,
    RequestResponse,
} from "@rian8337/osu-base";
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
     * @param mods The mods to use. Defaults to No Mod.
     * @param oldStatistics Whether to use old statistics for the calculation. Defaults to `false`.
     * @param customSpeedMultiplier The custom speed multiplier to calculate for. Defaults to 1.
     * @param forceAR The force AR to use. Defaults to none.
     * @returns The difficulty attributes, `null` if the difficulty attributes cannot be retrieved.
     */
    static async getDifficultyAttributes(
        beatmapHash: string,
        mode: Modes.droid,
        calculationMethod: PPCalculationMethod.live,
        mods?: (Mod & IModApplicableToDroid)[],
        oldStatistics?: boolean,
        customSpeedMultiplier?: number,
        forceAR?: number
    ): Promise<CacheableDifficultyAttributes<DroidDifficultyAttributes> | null>;

    /**
     * Retrieves a difficulty attributes from the backend.
     *
     * @param beatmapHash The MD5 hash of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param mods The mods to use. Defaults to No Mod.
     * @param oldStatistics Whether to use old statistics for the calculation. Defaults to `false`.
     * @param customSpeedMultiplier The custom speed multiplier to calculate for. Defaults to 1.
     * @param forceAR The force AR to use. Defaults to none.
     * @returns The difficulty attributes, `null` if the difficulty attributes cannot be retrieved.
     */
    static async getDifficultyAttributes(
        beatmapHash: string,
        mode: Modes.droid,
        calculationMethod: PPCalculationMethod.rebalance,
        mods?: (Mod & IModApplicableToDroid)[],
        oldStatistics?: boolean,
        customSpeedMultiplier?: number,
        forceAR?: number
    ): Promise<CacheableDifficultyAttributes<RebalanceDroidDifficultyAttributes> | null>;

    /**
     * Retrieves a difficulty attributes from the backend.
     *
     * @param beatmapHash The MD5 hash of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param mods The mods to use. Defaults to No Mod.
     * @param oldStatistics Whether to use old statistics for the calculation. Defaults to `false`.
     * @param customSpeedMultiplier The custom speed multiplier to calculate for. Defaults to 1.
     * @param forceAR The force AR to use. Defaults to none.
     * @returns The difficulty attributes, `null` if the difficulty attributes cannot be retrieved.
     */
    static async getDifficultyAttributes(
        beatmapHash: string,
        mode: Modes.osu,
        calculationMethod: PPCalculationMethod.live,
        mods?: (Mod & IModApplicableToOsu)[],
        oldStatistics?: boolean,
        customSpeedMultiplier?: number,
        forceAR?: number
    ): Promise<CacheableDifficultyAttributes<OsuDifficultyAttributes> | null>;

    /**
     * Retrieves a difficulty attributes from the backend.
     *
     * @param beatmapHash The MD5 hash of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param mods The mods to use. Defaults to No Mod.
     * @param oldStatistics Whether to use old statistics for the calculation. Defaults to `false`.
     * @param customSpeedMultiplier The custom speed multiplier to calculate for. Defaults to 1.
     * @param forceAR The force AR to use. Defaults to none.
     * @returns The difficulty attributes, `null` if the difficulty attributes cannot be retrieved.
     */
    static async getDifficultyAttributes(
        beatmapHash: string,
        mode: Modes.osu,
        calculationMethod: PPCalculationMethod.rebalance,
        mods?: (Mod & IModApplicableToOsu)[],
        oldStatistics?: boolean,
        customSpeedMultiplier?: number,
        forceAR?: number
    ): Promise<CacheableDifficultyAttributes<RebalanceOsuDifficultyAttributes> | null>;

    static async getDifficultyAttributes(
        beatmapHash: string,
        mode: Modes,
        calculationMethod: PPCalculationMethod,
        mods?: Mod[],
        oldStatistics?: boolean,
        customSpeedMultiplier?: number,
        forceAR?: number
    ): Promise<CacheableDifficultyAttributes<RawDifficultyAttributes> | null> {
        const url: URL = new URL(`${this.endpoint}get-difficulty-attributes`);
        url.searchParams.set("key", process.env.DROID_INTERNAL_SERVER_KEY!);
        url.searchParams.set("beatmaphash", beatmapHash);
        url.searchParams.set("mode", mode);
        url.searchParams.set("calculationmethod", calculationMethod.toString());

        if (mods && mods.length > 0) {
            url.searchParams.set(
                "mods",
                mods.reduce((a, v) => a + v, "")
            );
        }

        if (oldStatistics) {
            url.searchParams.set("oldstatistics", "1");
        }

        if (
            customSpeedMultiplier !== undefined &&
            customSpeedMultiplier !== 1
        ) {
            url.searchParams.set(
                "customspeedmultiplier",
                customSpeedMultiplier.toString()
            );
        }

        if (forceAR !== undefined) {
            url.searchParams.set("forcear", forceAR.toString());
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
