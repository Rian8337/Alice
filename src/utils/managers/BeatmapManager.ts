import * as d3 from "d3";
import { AttachmentBuilder, GuildEmoji, Message, Snowflake } from "discord.js";
import {
    MapInfo,
    OsuAPIRequestBuilder,
    OsuAPIResponse,
} from "@rian8337/osu-base";
import { Manager } from "@alice-utils/base/Manager";
import { CacheManager } from "./CacheManager";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { Canvas, createCanvas, CanvasRenderingContext2D } from "canvas";
import { HelperFunctions } from "@alice-utils/helpers/HelperFunctions";
import { ScoreRank } from "structures/utils/ScoreRank";
import { BeatmapRetrievalOptions } from "@alice-structures/utils/BeatmapRetrievalOptions";

/**
 * A manager for beatmaps.
 */
export abstract class BeatmapManager extends Manager {
    /**
     * Color spectrum for difficulty rating icon.
     */
    private static readonly difficultyColorSpectrum: d3.ScaleLinear<
        string,
        string,
        never
    > = d3
        .scaleLinear<string>()
        .domain([0.1, 1.25, 2, 2.5, 3.3, 4.2, 4.9, 5.8, 6.7, 7.7, 9])
        .clamp(true)
        .range([
            "#4290FB",
            "#4FC0FF",
            "#4FFFD5",
            "#7CFF4F",
            "#F6F05C",
            "#FF8068",
            "#FF4E6F",
            "#C645B8",
            "#6563DE",
            "#18158E",
            "#000000",
        ])
        .interpolate(d3.interpolateRgb.gamma(2.2));

    /**
     * Gets a beatmap from the beatmap cache, or downloads it if it's not available.
     *
     * @param beatmapIdOrHash The beatmap ID or MD5 hash of the beatmap.
     * @param options Options for the retrieval of the beatmap.
     * @returns A `MapInfo` instance representing the beatmap.
     */
    static async getBeatmap<T extends boolean = true>(
        beatmapIdOrHash: number | string,
        options?: BeatmapRetrievalOptions & { checkFile?: T }
    ): Promise<MapInfo<T> | null> {
        const oldCache: MapInfo | undefined = CacheManager.beatmapCache.find(
            (v) => v.beatmapID === beatmapIdOrHash || v.hash === beatmapIdOrHash
        );

        if (oldCache && !options?.forceCheck) {
            if (options?.checkFile !== false) {
                await oldCache.retrieveBeatmapFile();
            }

            return oldCache;
        }

        const newCache: MapInfo | null = await MapInfo.getInformation(
            beatmapIdOrHash,
            options?.checkFile
        );

        if (!newCache) {
            return null;
        }

        if (options?.cacheBeatmap !== false) {
            CacheManager.beatmapCache.set(newCache.beatmapID, newCache);
        }

        return newCache;
    }

    /**
     * Gets the list of beatmaps from a beatmapset.
     *
     * @param beatmapsetID The ID of the beatmapset.
     * @param checkFile Whether to check if beatmap file for each beatmap is downloaded, and downloads it if it's not downloaded. Defaults to `true`.
     * @returns An array of `MapInfo` instance representing each beatmap in the beatmapset.
     */
    static async getBeatmaps(
        beatmapsetID: number,
        checkFile: boolean = true
    ): Promise<MapInfo[]> {
        const apiRequestBuilder: OsuAPIRequestBuilder =
            new OsuAPIRequestBuilder();

        apiRequestBuilder
            .setEndpoint("get_beatmaps")
            .addParameter("s", beatmapsetID);

        const result = await apiRequestBuilder.sendRequest();

        if (result.statusCode !== 200) {
            throw new Error("osu! API request returned a non-200 response");
        }

        const beatmaps: MapInfo[] = [];

        const beatmapsData: OsuAPIResponse[] = JSON.parse(
            result.data.toString("utf-8")
        );

        for (const beatmapData of beatmapsData) {
            if (beatmapData.mode !== "0") {
                continue;
            }

            const beatmapInfo: MapInfo = new MapInfo();

            beatmapInfo.fillMetadata(beatmapData);

            if (!beatmapInfo.title) {
                continue;
            }

            if (checkFile) {
                await beatmapInfo.retrieveBeatmapFile(true);
            }

            beatmaps.push(beatmapInfo);

            CacheManager.beatmapCache.set(beatmapInfo.beatmapID, beatmapInfo);
        }

        return beatmaps;
    }

    /**
     * Gets the latest cached beatmap in a channel.
     *
     * @param channelID The ID of the channel.
     * @returns The MD5 hash of the beatmap, `undefined` if not found.
     */
    static getChannelLatestBeatmap(channelID: Snowflake): string | undefined {
        return CacheManager.channelMapCache.get(channelID);
    }

    /**
     * Sets the latest cached beatmap in a channel.
     *
     * @param channelID The ID of the channel.
     * @param hash The MD5 hash of the beatmap.
     */
    static setChannelLatestBeatmap(channelID: Snowflake, hash: string): void {
        CacheManager.channelMapCache.set(channelID, hash);
    }

    /**
     * Gets beatmap IDs from a string.
     *
     * @param str The string to get the beatmap IDs from.
     * @returns All beatmap IDs from the string.
     */
    static getBeatmapID(str: string): number[] {
        const IDs: number[] = [];

        if (!str) {
            return IDs;
        }

        const strArray: string[] = str.split(/\s+/g);

        for (const s of strArray) {
            let id: number = parseInt(s);

            if (NumberHelper.isNumeric(s)) {
                IDs.push(id);
                continue;
            }

            if (
                !s.startsWith("https://osu.ppy.sh/") &&
                !s.startsWith("https://dev.ppy.sh/")
            ) {
                continue;
            }

            if (
                [
                    s.indexOf("#osu/"),
                    s.indexOf("/b/"),
                    s.indexOf("/beatmaps/"),
                ].every((v) => v === -1)
            ) {
                continue;
            }

            const split: string[] = s.split("/");

            const index: number =
                split.indexOf("beatmaps") + 1 ||
                split.indexOf("b") + 1 ||
                split.findIndex((v) => v.includes("#osu")) + 1;

            id = parseInt(split[index]);

            if (!isNaN(id)) {
                IDs.push(id);
            }
        }

        return IDs;
    }

    /**
     * Gets beatmapset IDs from a string.
     *
     * @param str The string to get the beatmapset IDs from.
     * @returns All beatmapset IDs from the string.
     */
    static getBeatmapsetID(str: string): number[] {
        const IDs: number[] = [];

        const strArray: string[] = str.split(/\s+/g);

        for (const s of strArray) {
            if (
                !s.startsWith("https://osu.ppy.sh/") &&
                !s.startsWith("https://dev.ppy.sh/")
            ) {
                continue;
            }

            if (
                [s.indexOf("/beatmapsets/"), s.indexOf("/s/")].every(
                    (v) => v === -1
                )
            ) {
                continue;
            }

            const split: string[] = s.split("/");

            const index: number =
                split.indexOf("beatmapsets") + 1 || split.indexOf("s") + 1;

            const id: number = parseInt(split[index]);

            if (!isNaN(id)) {
                IDs.push(id);
            }
        }

        return IDs;
    }

    /**
     * Attempts to retrieve a beatmap ID from a message.
     *
     * The function will attempt to retrieve a beatmap ID from the message embeds' author URL and URL.
     * If none are found, it will attempt to retrieve from the message's content.
     *
     * @param message The message.
     * @returns The beatmap ID, `null` if not found.
     */
    static getBeatmapIDFromMessage(message: Message): number | null {
        let beatmapId: number | null = null;

        for (const embed of message.embeds) {
            const id: number =
                this.getBeatmapID(embed.author?.url ?? "")[0] ??
                this.getBeatmapID(embed.url ?? "")[0];

            if (id) {
                beatmapId = id;

                break;
            }
        }

        if (!beatmapId) {
            for (const arg of message.content.split(/\s+/g)) {
                const id: number = this.getBeatmapID(arg)[0];

                if (id) {
                    beatmapId = id;

                    break;
                }
            }
        }

        return beatmapId;
    }

    /**
     * Gets the difficulty icon of a beatmap.
     *
     * @param rating The difficulty rating of the beatmap.
     * @returns A difficulty icon representing the beatmap's difficulty.
     */
    static getBeatmapDifficultyIcon(rating: number): Buffer {
        const canvas: Canvas = createCanvas(128, 128);

        const c: CanvasRenderingContext2D = canvas.getContext("2d");

        c.fillStyle = this.getBeatmapDifficultyColor(rating);

        c.beginPath();
        c.arc(canvas.width / 2, canvas.height / 2, 60, 0, 2 * Math.PI);
        c.fill();
        c.closePath();

        // Separate inner and outer circles
        c.globalCompositeOperation = "destination-out";
        c.beginPath();
        c.arc(canvas.width / 2, canvas.height / 2, 55, 0, 2 * Math.PI);
        c.fill();
        c.closePath();

        c.globalCompositeOperation = "source-over";
        c.beginPath();
        c.arc(canvas.width / 2, canvas.height / 2, 40, 0, 2 * Math.PI);
        c.fill();
        c.closePath();

        return canvas.toBuffer();
    }

    /**
     * Gets a color representing a difficulty value.
     *
     * @param rating The difficulty value.
     * @returns The color in hex code.
     */
    static getBeatmapDifficultyColor(rating: number): string {
        switch (true) {
            case rating < 0.1:
                return "#AAAAAA";
            case rating >= 9:
                return "#000000";
            default:
                return HelperFunctions.rgbToHex(
                    this.difficultyColorSpectrum(rating)
                );
        }
    }

    /**
     * Generates an `AttachmentBuilder` of a beatmap's difficulty icon.
     *
     * @param rating The difficulty rating of the beatmap.
     * @returns The generated `AttachmentBuilder`.
     */
    static getBeatmapDifficultyIconAttachment(
        rating: number
    ): AttachmentBuilder {
        return new AttachmentBuilder(this.getBeatmapDifficultyIcon(rating), {
            name: `osu-${rating.toFixed(2)}.png`,
        });
    }

    /**
     * Gets an emoji that represents a rank.
     *
     * @param rank The rank.
     * @returns The emoji representing the rank.
     */
    static getRankEmote(rank: ScoreRank): GuildEmoji {
        switch (rank) {
            case "A":
                return this.client.emojis.resolve("611559473236148265")!;
            case "B":
                return this.client.emojis.resolve("611559473169039413")!;
            case "C":
                return this.client.emojis.resolve("611559473328422942")!;
            case "D":
                return this.client.emojis.resolve("611559473122639884")!;
            case "S":
                return this.client.emojis.resolve("611559473294606336")!;
            case "X":
                return this.client.emojis.resolve("611559473492000769")!;
            case "SH":
                return this.client.emojis.resolve("611559473361846274")!;
            case "XH":
                return this.client.emojis.resolve("611559473479155713")!;
        }
    }
}
