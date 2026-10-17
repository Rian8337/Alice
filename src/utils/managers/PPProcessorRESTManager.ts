import { PPCalculationMethod } from "@enums/utils/PPCalculationMethod";
import { Modes, RequestResponse, SerializedMod } from "@rian8337/osu-base";
import {
    CacheableDifficultyAttributes,
    DroidDifficultyAttributes,
    OsuDifficultyAttributes,
} from "@rian8337/osu-difficulty-calculator";
import {
    DroidDifficultyAttributes as RebalanceDroidDifficultyAttributes,
    OsuDifficultyAttributes as RebalanceOsuDifficultyAttributes,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import { CompleteCalculationAttributes } from "@structures/difficultyattributes/CompleteCalculationAttributes";
import { DroidPerformanceAttributes } from "@structures/difficultyattributes/DroidPerformanceAttributes";
import { OsuPerformanceAttributes } from "@structures/difficultyattributes/OsuPerformanceAttributes";
import { PerformanceAttributes } from "@structures/difficultyattributes/PerformanceAttributes";
import { RawDifficultyAttributes } from "@structures/difficultyattributes/RawDifficultyAttributes";
import { CloneablePerformanceCalculationParameters } from "@structures/pp/CloneablePerformanceCalculationParameters";
import { RebalanceDroidPerformanceAttributes } from "@structures/difficultyattributes/RebalanceDroidPerformanceAttributes";
import {
    PPBrokerDifficultyResponse,
    PPBrokerPerformanceResponse,
    PPOnlineScoreResponse,
} from "@structures/utils/PPBrokerResponse";
import { PPProcessorCalculationResponse } from "@structures/utils/PPProcessorCalculationResponse";
import { PPVariantSummary } from "@structures/utils/PPVariantSummary";
import { DefaultPPVariants } from "@utils/pp/DefaultPPVariants";
import { DifficultyCalculationParameters } from "@utils/pp/DifficultyCalculationParameters";
import { PerformanceCalculationParameters } from "@utils/pp/PerformanceCalculationParameters";
import { consola } from "consola";
import { RESTManager } from "./RESTManager";

/**
 * A REST manager for the performance points processors.
 *
 * Difficulty and performance calculations go through the broker, which routes them to the
 * processor of a variant (`droid-live`, `droid-rebalance`, `osu-live`, or `osu-rebalance`).
 * Online score calculations go through the score service.
 */
export abstract class PPProcessorRESTManager extends RESTManager {
    /**
     * The broker's URL, from `DPP_BROKER_URL`.
     */
    private static get brokerUrl(): string {
        return this.requireEnv("DPP_BROKER_URL");
    }

    /**
     * The score service's URL, from `DPP_SCORE_SERVICE_URL`.
     */
    private static get scoreServiceUrl(): string {
        return this.requireEnv("DPP_SCORE_SERVICE_URL");
    }

    private static requireEnv(name: string): string {
        const value = process.env[name];

        if (!value) {
            throw new Error(`${name} is not set`);
        }

        return value;
    }

    /**
     * Gets the name of the variant that calculates a gamemode with a calculation method.
     *
     * @param mode The gamemode.
     * @param calculationMethod The calculation method.
     * @returns The variant name.
     */
    private static getVariant(
        mode: Modes,
        calculationMethod: PPCalculationMethod,
    ): string {
        if (mode === Modes.Droid) {
            return calculationMethod === PPCalculationMethod.live
                ? DefaultPPVariants.droidLive
                : DefaultPPVariants.droidRebalance;
        }

        return calculationMethod === PPCalculationMethod.live
            ? DefaultPPVariants.osuLive
            : DefaultPPVariants.osuRebalance;
    }

    /**
     * Converts a strain chart from the broker (a base64 PNG) to the form callers use.
     *
     * @param strainChart The base64-encoded strain chart, if any.
     * @returns The strain chart in binary data, `null` if there is none.
     */
    private static decodeStrainChart(strainChart?: string): number[] | null {
        return strainChart
            ? Array.from(Buffer.from(strainChart, "base64"))
            : null;
    }

    /**
     * The processor reports only the difficulty-adjusting mods in difficulty attributes, whereas
     * callers expect all of the mods that were calculated.
     */
    private static withMods(
        difficulty: CacheableDifficultyAttributes<RawDifficultyAttributes>,
        mods: SerializedMod[],
    ): CacheableDifficultyAttributes<RawDifficultyAttributes> {
        return { ...difficulty, mods };
    }

    private static getBeatmapReference(beatmapIdOrHash: string | number) {
        return typeof beatmapIdOrHash === "number"
            ? { id: beatmapIdOrHash }
            : { hash: beatmapIdOrHash.toLowerCase() };
    }

    private static getMods(
        calculationParams?: DifficultyCalculationParameters,
    ): SerializedMod[] {
        return calculationParams?.mods && !calculationParams.mods.isEmpty
            ? calculationParams.mods.serializeMods()
            : [];
    }

    /**
     * Gets the headers that identify the bot to the broker or the score service.
     *
     * @param apiKey The API key.
     * @param actingUid The uid of the player that the request is made on behalf of, if any.
     * @returns The headers.
     */
    private static getHeaders(
        apiKey: string | undefined,
        actingUid?: number,
    ): Record<string, string> {
        return {
            "X-Api-Key": apiKey!,
            ...(actingUid !== undefined && {
                "X-Acting-Uid": actingUid.toString(),
            }),
        };
    }

    /**
     * Sends a request to the broker.
     *
     * @param path The path to request, relative to the broker's URL.
     * @param options The options of the request.
     * @param actingUid The uid of the player that the request is made on behalf of, if any.
     * @returns The parsed response body, `null` if the request failed.
     */
    private static async requestBroker<T>(
        path: string,
        options: RequestInit,
        actingUid?: number,
    ): Promise<T | null> {
        const url = new URL(`${this.brokerUrl.replace(/\/+$/, "")}${path}`);

        const result = await this.request(url, {
            ...options,
            headers: {
                ...options.headers,
                ...this.getHeaders(process.env.DPP_BROKER_KEY, actingUid),
            },
        }).catch(() => null);

        if (result?.statusCode !== 200) {
            this.logError(url, result);

            return null;
        }

        return JSON.parse(result.data.toString("utf-8")) as T;
    }

    /**
     * Sends a JSON request to a variant's processor through the broker.
     *
     * @param variant The variant to send the request to.
     * @param route The processor's route.
     * @param body The request body.
     * @param actingUid The uid of the player that the request is made on behalf of, if any.
     * @returns The parsed response body, `null` if the request failed.
     */
    private static requestVariant<T>(
        variant: string,
        route: "difficulty" | "performance",
        body: object,
        actingUid?: number,
    ): Promise<T | null> {
        return this.requestBroker<T>(
            `/variants/${encodeURIComponent(variant)}/${route}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            },
            actingUid,
        );
    }

    /**
     * Gets the variants that are visible to a player.
     *
     * @param actingUid The uid of the player to get the variants for. Without it, only public variants are returned.
     * @returns The variants, `null` if the variants cannot be retrieved.
     */
    static getVariants(actingUid?: number): Promise<PPVariantSummary[] | null> {
        return this.requestBroker<PPVariantSummary[]>(
            "/variants",
            {},
            actingUid,
        );
    }

    /**
     * Retrieves a difficulty attributes from the backend.
     *
     * @param beatmapIdOrHash The MD5 hash or ID of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculationParams The difficulty calculation parameters to use.
     * @param generateStrainChart Whether to generate a strain chart.
     * @returns The difficulty attributes, `null` if the difficulty attributes cannot be retrieved.
     */
    static async getDifficultyAttributes<
        THasStrainChart extends boolean = false,
    >(
        beatmapIdOrHash: string | number,
        mode: Modes.Droid,
        calculationMethod: PPCalculationMethod.live,
        calculationParams?: DifficultyCalculationParameters,
        generateStrainChart?: THasStrainChart,
    ): Promise<PPProcessorCalculationResponse<
        CacheableDifficultyAttributes<DroidDifficultyAttributes>,
        THasStrainChart
    > | null>;

    /**
     * Retrieves a difficulty attributes from the backend.
     *
     * @param beatmapIdOrHash The MD5 hash or ID of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculationParams The difficulty calculation parameters to use.
     * @param generateStrainChart Whether to generate a strain chart.
     * @returns The difficulty attributes, `null` if the difficulty attributes cannot be retrieved.
     */
    static async getDifficultyAttributes<
        THasStrainChart extends boolean = false,
    >(
        beatmapIdOrHash: string | number,
        mode: Modes.Droid,
        calculationMethod: PPCalculationMethod.rebalance,
        calculationParams?: DifficultyCalculationParameters,
        generateStrainChart?: THasStrainChart,
    ): Promise<PPProcessorCalculationResponse<
        CacheableDifficultyAttributes<RebalanceDroidDifficultyAttributes>,
        THasStrainChart
    > | null>;

    /**
     * Retrieves a difficulty attributes from the backend.
     *
     * @param beatmapIdOrHash The MD5 hash or ID of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculationParams The difficulty calculation parameters to use.
     * @param generateStrainChart Whether to generate a strain chart.
     * @returns The difficulty attributes, `null` if the difficulty attributes cannot be retrieved.
     */
    static async getDifficultyAttributes<
        THasStrainChart extends boolean = false,
    >(
        beatmapIdOrHash: string | number,
        mode: Modes.Osu,
        calculationMethod: PPCalculationMethod.live,
        calculationParams?: DifficultyCalculationParameters,
        generateStrainChart?: THasStrainChart,
    ): Promise<PPProcessorCalculationResponse<
        CacheableDifficultyAttributes<OsuDifficultyAttributes>,
        THasStrainChart
    > | null>;

    /**
     * Retrieves a difficulty attributes from the backend.
     *
     * @param beatmapIdOrHash The MD5 hash or ID of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculationParams The difficulty calculation parameters to use.
     * @param generateStrainChart Whether to generate a strain chart.
     * @returns The difficulty attributes, `null` if the difficulty attributes cannot be retrieved.
     */
    static async getDifficultyAttributes<
        THasStrainChart extends boolean = false,
    >(
        beatmapIdOrHash: string | number,
        mode: Modes.Osu,
        calculationMethod: PPCalculationMethod.rebalance,
        calculationParams?: DifficultyCalculationParameters,
        generateStrainChart?: THasStrainChart,
    ): Promise<PPProcessorCalculationResponse<
        CacheableDifficultyAttributes<RebalanceOsuDifficultyAttributes>,
        THasStrainChart
    > | null>;

    static async getDifficultyAttributes<
        THasStrainChart extends boolean = false,
    >(
        beatmapIdOrHash: string | number,
        mode: Modes,
        calculationMethod: PPCalculationMethod,
        calculationParams?: DifficultyCalculationParameters,
        generateStrainChart?: THasStrainChart,
    ): Promise<PPProcessorCalculationResponse<
        CacheableDifficultyAttributes<RawDifficultyAttributes>,
        THasStrainChart
    > | null> {
        const mods = this.getMods(calculationParams);

        const response = await this.requestVariant<PPBrokerDifficultyResponse>(
            this.getVariant(mode, calculationMethod),
            "difficulty",
            {
                beatmap: this.getBeatmapReference(beatmapIdOrHash),
                mods: mods,
                strainChart: !!generateStrainChart,
            },
        );

        if (!response) {
            return null;
        }

        return {
            attributes: this.withMods(response.difficulty, mods),
            strainChart: this.decodeStrainChart(response.strainChart),
        } as PPProcessorCalculationResponse<
            CacheableDifficultyAttributes<RawDifficultyAttributes>,
            THasStrainChart
        >;
    }

    /**
     * Retrieves a difficulty and performance attributes from the backend.
     *
     * @param beatmapIdOrHash The MD5 hash or ID of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculationParams The performance calculation parameters to use.
     * @param generateStrainChart Whether to generate a strain chart.
     * @returns The difficulty and performance attributes, `null` if the attributes cannot be retrieved.
     */
    static async getPerformanceAttributes<THasStrainChart extends boolean>(
        beatmapIdOrHash: string | number,
        mode: Modes.Droid,
        calculationMethod: PPCalculationMethod.live,
        calculationParams?: PerformanceCalculationParameters,
        generateStrainChart?: THasStrainChart,
    ): Promise<PPProcessorCalculationResponse<
        CompleteCalculationAttributes<
            DroidDifficultyAttributes,
            DroidPerformanceAttributes
        >,
        THasStrainChart
    > | null>;

    /**
     * Retrieves a difficulty and performance attributes from the backend.
     *
     * @param beatmapIdOrHash The MD5 hash or ID of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculationParams The performance calculation parameters to use.
     * @param generateStrainChart Whether to generate a strain chart.
     * @returns The difficulty and performance attributes, `null` if the attributes cannot be retrieved.
     */
    static async getPerformanceAttributes<THasStrainChart extends boolean>(
        beatmapIdOrHash: string | number,
        mode: Modes.Droid,
        calculationMethod: PPCalculationMethod.rebalance,
        calculationParams?: PerformanceCalculationParameters,
        generateStrainChart?: THasStrainChart,
    ): Promise<PPProcessorCalculationResponse<
        CompleteCalculationAttributes<
            RebalanceDroidDifficultyAttributes,
            RebalanceDroidPerformanceAttributes
        >,
        THasStrainChart
    > | null>;

    /**
     * Retrieves a difficulty and performance attributes from the backend.
     *
     * @param beatmapIdOrHash The MD5 hash or ID of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculationParams The performance calculation parameters to use.
     * @param generateStrainChart Whether to generate a strain chart.
     * @returns The difficulty and performance attributes, `null` if the attributes cannot be retrieved.
     */
    static async getPerformanceAttributes<THasStrainChart extends boolean>(
        beatmapIdOrHash: string | number,
        mode: Modes.Osu,
        calculationMethod: PPCalculationMethod.live,
        calculationParams?: PerformanceCalculationParameters,
        generateStrainChart?: THasStrainChart,
    ): Promise<PPProcessorCalculationResponse<
        CompleteCalculationAttributes<
            OsuDifficultyAttributes,
            OsuPerformanceAttributes
        >,
        THasStrainChart
    > | null>;

    /**
     * Retrieves a difficulty and performance attributes from the backend.
     *
     * @param beatmapIdOrHash The MD5 hash or ID of the beatmap.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculationParams The performance calculation parameters to use.
     * @param generateStrainChart Whether to generate a strain chart.
     * @returns The difficulty and performance attributes, `null` if the attributes cannot be retrieved.
     */
    static async getPerformanceAttributes<THasStrainChart extends boolean>(
        beatmapIdOrHash: string | number,
        mode: Modes.Osu,
        calculationMethod: PPCalculationMethod.rebalance,
        calculationParams?: PerformanceCalculationParameters,
        generateStrainChart?: THasStrainChart,
    ): Promise<PPProcessorCalculationResponse<
        CompleteCalculationAttributes<
            RebalanceOsuDifficultyAttributes,
            OsuPerformanceAttributes
        >,
        THasStrainChart
    > | null>;

    static async getPerformanceAttributes<THasStrainChart extends boolean>(
        beatmapIdOrHash: string | number,
        mode: Modes,
        calculationMethod: PPCalculationMethod,
        calculationParams?: PerformanceCalculationParameters,
        generateStrainChart?: THasStrainChart,
    ): Promise<PPProcessorCalculationResponse<
        CompleteCalculationAttributes<
            RawDifficultyAttributes,
            PerformanceAttributes
        >,
        THasStrainChart
    > | null> {
        return this.getPerformanceAttributesForVariant(
            beatmapIdOrHash,
            this.getVariant(mode, calculationMethod),
            calculationParams,
            generateStrainChart,
        );
    }

    /**
     * Retrieves a difficulty and performance attributes from the backend by variant name.
     *
     * @param beatmapIdOrHash The MD5 hash or ID of the beatmap.
     * @param variant The name (or alias) of the variant to calculate with.
     * @param calculationParams The performance calculation parameters to use.
     * @param generateStrainChart Whether to generate a strain chart.
     * @param actingUid The uid of the player that the calculation is made on behalf of, if any.
     * @returns The difficulty and performance attributes, `null` if the attributes cannot be retrieved.
     */
    static async getPerformanceAttributesForVariant<
        THasStrainChart extends boolean,
    >(
        beatmapIdOrHash: string | number,
        variant: string,
        calculationParams?: PerformanceCalculationParameters,
        generateStrainChart?: THasStrainChart,
        actingUid?: number,
    ): Promise<PPProcessorCalculationResponse<
        CompleteCalculationAttributes<
            RawDifficultyAttributes,
            PerformanceAttributes
        >,
        THasStrainChart
    > | null> {
        const mods = this.getMods(calculationParams);

        const response = await this.requestVariant<PPBrokerPerformanceResponse>(
            variant,
            "performance",
            {
                beatmap: this.getBeatmapReference(beatmapIdOrHash),
                mods: mods,
                score: this.getScoreParameters(calculationParams),
                strainChart: !!generateStrainChart,
            },
            actingUid,
        );

        if (!response) {
            return null;
        }

        return {
            attributes: this.createCalculationAttributes(response, mods),
            strainChart: this.decodeStrainChart(response.strainChart),
        } as PPProcessorCalculationResponse<
            CompleteCalculationAttributes<
                RawDifficultyAttributes,
                PerformanceAttributes
            >,
            THasStrainChart
        >;
    }

    /**
     * Gets the difficulty and performance attributes of a score.
     *
     * @param uid The uid of the player in the score.
     * @param hash The MD5 hash of the beatmap in the score.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculateBestPPScore Whether to calculate the score with the best PP instead of the best score. Defaults to `false`.
     * @param generateStrainChart Whether to generate a strain chart.
     * @returns The difficulty and performance attributes, `null` if the attributes cannot be retrieved.
     */
    static async getOnlineScoreAttributes<THasStrainChart extends boolean>(
        uid: number,
        hash: string,
        mode: Modes.Droid,
        calculationMethod: PPCalculationMethod.live,
        calculateBestPPScore?: boolean,
        generateStrainChart?: THasStrainChart,
    ): Promise<PPProcessorCalculationResponse<
        CompleteCalculationAttributes<
            DroidDifficultyAttributes,
            DroidPerformanceAttributes
        >,
        THasStrainChart
    > | null>;

    /**
     * Gets the difficulty and performance attributes of a score.
     *
     * @param uid The uid of the player in the score.
     * @param hash The MD5 hash of the beatmap in the score.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculateBestPPScore Whether to calculate the score with the best PP instead of the best score. Defaults to `false`.
     * @param generateStrainChart Whether to generate a strain chart.
     * @param useMaster Unused. Online scores are always calculated by the score service.
     * @returns The difficulty and performance attributes, `null` if the attributes cannot be retrieved.
     */
    static async getOnlineScoreAttributes<THasStrainChart extends boolean>(
        uid: number,
        hash: string,
        mode: Modes.Droid,
        calculationMethod: PPCalculationMethod.rebalance,
        calculateBestPPScore?: boolean,
        generateStrainChart?: THasStrainChart,
        useMaster?: boolean,
    ): Promise<PPProcessorCalculationResponse<
        CompleteCalculationAttributes<
            RebalanceDroidDifficultyAttributes,
            RebalanceDroidPerformanceAttributes
        >,
        THasStrainChart
    > | null>;

    /**
     * Gets the difficulty and performance attributes of a score.
     *
     * @param uid The uid of the player in the score.
     * @param hash The MD5 hash of the beatmap in the score.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculateBestPPScore Whether to calculate the score with the best PP instead of the best score. Defaults to `false`.
     * @param generateStrainChart Whether to generate a strain chart.
     * @returns The difficulty and performance attributes, `null` if the attributes cannot be retrieved.
     */
    static async getOnlineScoreAttributes<THasStrainChart extends boolean>(
        uid: number,
        hash: string,
        mode: Modes.Osu,
        calculationMethod: PPCalculationMethod.live,
        calculateBestPPScore?: boolean,
        generateStrainChart?: THasStrainChart,
    ): Promise<PPProcessorCalculationResponse<
        CompleteCalculationAttributes<
            OsuDifficultyAttributes,
            OsuPerformanceAttributes
        >,
        THasStrainChart
    > | null>;

    /**
     * Gets the difficulty and performance attributes of a score.
     *
     * @param uid The uid of the player in the score.
     * @param hash The MD5 hash of the beatmap in the score.
     * @param mode The gamemode to calculate.
     * @param calculationMethod The calculation method to use.
     * @param calculateBestPPScore Whether to calculate the score with the best PP instead of the best score. Defaults to `false`.
     * @param generateStrainChart Whether to generate a strain chart.
     * @param useMaster Unused. Online scores are always calculated by the score service.
     * @returns The difficulty and performance attributes, `null` if the attributes cannot be retrieved.
     */
    static async getOnlineScoreAttributes<THasStrainChart extends boolean>(
        uid: number,
        hash: string,
        mode: Modes.Osu,
        calculationMethod: PPCalculationMethod.rebalance,
        calculateBestPPScore?: boolean,
        generateStrainChart?: THasStrainChart,
        useMaster?: boolean,
    ): Promise<PPProcessorCalculationResponse<
        CompleteCalculationAttributes<
            RebalanceOsuDifficultyAttributes,
            OsuPerformanceAttributes
        >,
        THasStrainChart
    > | null>;

    static async getOnlineScoreAttributes<THasStrainChart extends boolean>(
        uid: number,
        hash: string,
        mode: Modes,
        calculationMethod: PPCalculationMethod,
        calculateBestPPScore?: boolean,
        generateStrainChart?: THasStrainChart,
        _useMaster?: boolean,
    ): Promise<PPProcessorCalculationResponse<
        CompleteCalculationAttributes<
            RawDifficultyAttributes,
            PerformanceAttributes
        >,
        THasStrainChart
    > | null> {
        return this.getOnlineScoreAttributesForVariant(
            uid,
            hash,
            this.getVariant(mode, calculationMethod),
            calculateBestPPScore,
            generateStrainChart,
        );
    }

    /**
     * Gets the difficulty and performance attributes of a score by variant name.
     *
     * @param uid The uid of the player in the score.
     * @param hash The MD5 hash of the beatmap in the score.
     * @param variant The name (or alias) of the variant to calculate with.
     * @param calculateBestPPScore Whether to calculate the score with the best PP instead of the best score. Defaults to `false`.
     * @param generateStrainChart Whether to generate a strain chart.
     * @param actingUid The uid of the player that the calculation is made on behalf of, if any.
     * @returns The difficulty and performance attributes, `null` if the attributes cannot be retrieved.
     */
    static async getOnlineScoreAttributesForVariant<
        THasStrainChart extends boolean,
    >(
        uid: number,
        hash: string,
        variant: string,
        calculateBestPPScore?: boolean,
        generateStrainChart?: THasStrainChart,
        actingUid?: number,
    ): Promise<PPProcessorCalculationResponse<
        CompleteCalculationAttributes<
            RawDifficultyAttributes,
            PerformanceAttributes
        >,
        THasStrainChart
    > | null> {
        const url = new URL(
            `${this.scoreServiceUrl.replace(/\/+$/, "")}/online-scores`,
        );

        url.searchParams.set("uid", uid.toString());
        url.searchParams.set("hash", hash.toLowerCase());
        url.searchParams.set("variant", variant);

        if (calculateBestPPScore) {
            url.searchParams.set("best", "true");
        }

        if (generateStrainChart) {
            url.searchParams.set("strainChart", "true");
        }

        const result = await this.request(url, {
            headers: this.getHeaders(
                process.env.DPP_SCORE_SERVICE_KEY,
                actingUid,
            ),
        }).catch(() => null);

        if (result?.statusCode !== 200) {
            this.logError(url, result);

            return null;
        }

        const { score, calculation } = JSON.parse(
            result.data.toString("utf-8"),
        ) as PPOnlineScoreResponse;

        return {
            attributes: this.createCalculationAttributes(
                calculation,
                score.mods,
            ),
            strainChart: this.decodeStrainChart(calculation.strainChart),
        } as PPProcessorCalculationResponse<
            CompleteCalculationAttributes<
                RawDifficultyAttributes,
                PerformanceAttributes
            >,
            THasStrainChart
        >;
    }

    /**
     * Converts performance calculation parameters to the `score` of a performance request.
     *
     * @param calculationParams The performance calculation parameters.
     * @returns The `score`, which is empty if there are no parameters (a perfect play).
     */
    private static getScoreParameters(
        calculationParams?: PerformanceCalculationParameters,
    ) {
        if (!calculationParams) {
            return {};
        }

        const { accuracy } = calculationParams;

        return {
            // A negative `n300` means that it has not been decided, so the processor derives it.
            ...(accuracy.n300 >= 0 && { n300: accuracy.n300 }),
            n100: accuracy.n100,
            n50: accuracy.n50,
            nmiss: accuracy.nmiss,
            combo: calculationParams.combo,
            sliderTicksMissed: calculationParams.sliderTicksMissed,
            sliderEndsDropped: calculationParams.sliderEndsDropped,
            totalScore: calculationParams.totalScore,
        };
    }

    /**
     * Converts a performance response to the attributes callers use.
     *
     * @param response The performance response.
     * @param mods All of the mods that were calculated.
     * @returns The complete calculation attributes.
     */
    private static createCalculationAttributes(
        response: PPBrokerPerformanceResponse,
        mods: SerializedMod[],
    ): CompleteCalculationAttributes<
        RawDifficultyAttributes,
        PerformanceAttributes
    > {
        const { score, replay } = response;

        return {
            params: {
                mods: mods,
                combo: score.combo,
                accuracy: {
                    n300: score.n300,
                    n100: score.n100,
                    n50: score.n50,
                    nmiss: score.nmiss,
                },
                tapPenalty: score.tapPenalty,
                sliderCheesePenalty: score.sliderCheesePenalty,
                sliderTicksMissed: score.sliderTicksMissed,
                sliderEndsDropped: score.sliderEndsDropped,
                totalScore: score.totalScore,
                // Values that the score does not record stay undefined, as they always have.
            } as CloneablePerformanceCalculationParameters<true>,
            difficulty: this.withMods(response.difficulty, mods),
            performance: response.performance,
            ...(replay && {
                replay: {
                    hitError: replay.hitError ?? undefined,
                    sliderTickInformation:
                        replay.sliderTickInformation ?? undefined,
                    sliderEndInformation:
                        replay.sliderEndInformation ?? undefined,
                },
            }),
        };
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
                url.toString(),
                result.data.toString("utf-8"),
            );
        } else {
            consola.error(
                "Request to %s failed with unknown error",
                url.toString(),
            );
        }
    }
}
