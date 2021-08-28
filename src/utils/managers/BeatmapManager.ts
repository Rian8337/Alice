import * as d3 from "d3";
import { MessageAttachment, Snowflake } from "discord.js";
import { MapInfo, OsuAPIRequestBuilder, OsuAPIResponse } from "osu-droid";
import { Manager } from "@alice-utils/base/Manager";
import { CacheManager } from "./CacheManager";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { Canvas, createCanvas, NodeCanvasRenderingContext2D } from "canvas";
import { HelperFunctions } from "@alice-utils/helpers/HelperFunctions";

/**
 * A manager for beatmaps.
 */
export abstract class BeatmapManager extends Manager {
    /**
     * Color spectrum for difficulty rating icon.
     */
    private static readonly difficultyColorSpectrum: d3.ScaleLinear<string, string, never> =
        d3.scaleLinear<string>()
            .domain([1.5, 2, 2.5, 3.25, 4.5, 6, 7, 8])
            .clamp(true)
            .range(["#4FC0FF", "#4FFFD5", "#7CFF4F", "#F6F05C", "#FF8068", "#FF3C71", "#6563DE", "#18158E"])
            .interpolate(d3.interpolateRgb.gamma(2.2));

    /**
     * Gets a beatmap from the beatmap cache.
     * 
     * @param beatmapIDorHash The beatmap ID or MD5 hash of the beatmap.
     * @param checkFile Whether to check if the beatmap's `.osu` file is downloaded, and downloads it if it's not. Defaults to `true`.
     * @param forceCheck Whether to skip the cache check and request the osu! API. Defaults to `false`.
     * @returns A `MapInfo` instance representing the beatmap.
     */
    static async getBeatmap(beatmapIDorHash: number | string, checkFile: boolean = true, forceCheck: boolean = false): Promise<MapInfo | null> {
        const oldCache: MapInfo | undefined = CacheManager.beatmapCache.find(
            v => v.beatmapID === beatmapIDorHash || v.hash === beatmapIDorHash
        );

        if (oldCache && !forceCheck) {
            if (checkFile) {
                await oldCache.retrieveBeatmapFile();
            }

            return oldCache;
        }

        const newCache: MapInfo = await MapInfo.getInformation(
            typeof beatmapIDorHash === "number" ? { beatmapID: beatmapIDorHash, file: checkFile } : { hash: beatmapIDorHash, file: checkFile }
        );

        if (!newCache.title || !newCache.objects) {
            return null;
        }

        CacheManager.beatmapCache.set(newCache.beatmapID, newCache);

        return newCache;
    }

    /**
     * Gets the list of beatmaps from a beatmapset.
     * 
     * @param beatmapsetID The ID of the beatmapset.
     * @param checkFile Whether to check if beatmap file for each beatmap is downloaded, and downloads it if it's not downloaded. Defaults to `true`.
     * @returns An array of `MapInfo` instance representing each beatmap in the beatmapset.
     */
    static getBeatmaps(beatmapsetID: number, checkFile: boolean = true): Promise<MapInfo[]> {
        return new Promise(async (resolve, reject) => {
            const apiRequestBuilder: OsuAPIRequestBuilder = new OsuAPIRequestBuilder();

            apiRequestBuilder.setEndpoint("get_beatmaps")
                .addParameter("s", beatmapsetID);

            const result = await apiRequestBuilder.sendRequest();

            if (result.statusCode !== 200) {
                return reject("osu! API request returned a non-200 response");
            }

            const beatmaps: MapInfo[] = [];

            const beatmapsData: OsuAPIResponse[] = JSON.parse(result.data.toString("utf-8"));

            for (const beatmapData of beatmapsData) {
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

            resolve(beatmaps);
        });
    }

    /**
     * Gets the latest cached beatmap in a channel.
     * 
     * @param channelID The ID of the channel.
     * @returns The MD5 hash of the beatmap, `undefined` if not found.
     */
    static getChannelLatestBeatmap(channelID: Snowflake): string|undefined {
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

            if (!s.startsWith("https://osu.ppy.sh/")) {
                continue;
            }

            if ([s.indexOf("#osu/"), s.indexOf("/b/"), s.indexOf("/beatmaps/")].every(v => v === -1)) {
                continue;
            }

            const split: string[] = s.split("/");

            const index: number = split.indexOf("beatmaps") + 1 || split.indexOf("b") + 1 || split.findIndex(v => v.includes("#osu")) + 1;

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
            if (!s.startsWith("https://osu.ppy.sh/")) {
                continue;
            }

            if ([s.indexOf("/beatmapsets/"), s.indexOf("/s/")].every(v => v === -1)) {
                continue;
            }

            const split: string[] = s.split("/");

            const index: number = split.indexOf("beatmapsets") + 1 || split.indexOf("s") + 1;

            const id: number = parseInt(split[index]);

            if (!isNaN(id)) {
                IDs.push(id);
            }
        }

        return IDs;
    }

    /**
     * Gets the difficulty icon of a beatmap.
     * 
     * @param rating The difficulty rating of the beatmap.
     * @returns A difficulty icon representing the beatmap's difficulty.
     */
    static getBeatmapDifficultyIcon(rating: number): Buffer {
        const color: string = this.getBeatmapDifficultyColor(rating);

        const canvas: Canvas = createCanvas(128, 128);

        const c: NodeCanvasRenderingContext2D = canvas.getContext("2d");

        c.fillStyle = color;

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
        return rating >= 8 ? "#000000" : HelperFunctions.rgbToHex(this.difficultyColorSpectrum(rating));
    }

    /**
     * Generates a `MessageAttachment` of a beatmap's difficulty icon.
     * 
     * @param rating The difficulty rating of the beatmap.
     * @returns The generated `MessageAttachment`.
     */
    static getBeatmapDifficultyIconAttachment(rating: number): MessageAttachment {
        return new MessageAttachment(
            this.getBeatmapDifficultyIcon(rating),
            `osu-${rating.toFixed(2)}.png`
        );
    }
}