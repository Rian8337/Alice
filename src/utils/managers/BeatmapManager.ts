import * as d3 from "d3";
import {
    AttachmentBuilder,
    bold,
    ColorResolvable,
    GuildEmoji,
    hyperlink,
    Message,
    Snowflake,
} from "discord.js";
import {
    MapInfo,
    MapStats,
    MathUtils,
    Modes,
    OsuAPIRequestBuilder,
    OsuAPIResponse,
    Precision,
    RankedStatus,
    TimingControlPoint,
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
                [s.indexOf("/beatmapsets/"), s.indexOf("/s/")].every(
                    (v) => v === -1
                )
            ) {
                continue;
            }

            const split: string[] = s.split("/");

            const index: number =
                split.indexOf("beatmapsets") + 1 || split.indexOf("s") + 1;

            id = parseInt(split[index]);

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

    /**
     * Shows a beatmap's statistics based on applied statistics and option.
     *
     * - Option `0`: return map title and mods used if defined
     * - Option `1`: return song source and map download link to beatmap mirrors
     * - Option `2`: return circle, slider, and spinner count
     * - Option `3`: return CS, AR, OD, HP, and max score statistics for droid
     * - Option `4`: return CS, AR, OD, HP, and max score statistics for PC
     * - Option `5`: return BPM, map length, and max combo
     * - Option `6`: return last update date and map status
     * - Option `7`: return favorite count and play count
     *
     * @param beatmapInfo The beatmap info to show.
     * @param option The option to pick.
     * @param stats The custom statistics to apply. This will only be used to apply mods, custom speed multiplier, and force AR.
     */
    static showStatistics(
        beatmapInfo: MapInfo,
        option: number,
        stats?: MapStats
    ): string {
        const mapParams = {
            cs: beatmapInfo.cs,
            ar: beatmapInfo.ar,
            od: beatmapInfo.od,
            hp: beatmapInfo.hp,
            mods: stats?.mods ?? [],
            isForceAR: false,
            speedMultiplier: 1,
        };
        if (stats) {
            if (stats.isForceAR) {
                mapParams.ar = stats.ar ?? mapParams.ar;
            }
            mapParams.isForceAR = stats.isForceAR ?? mapParams.isForceAR;
            mapParams.speedMultiplier =
                stats.speedMultiplier ?? mapParams.speedMultiplier;
        }

        switch (option) {
            case 0: {
                const mapStatistics: MapStats = new MapStats(
                    mapParams
                ).calculate();

                let string: string = `${beatmapInfo.fullTitle}${
                    (mapStatistics.mods.length ?? 0) > 0
                        ? ` +${mapStatistics.mods
                              .map((m) => m.acronym)
                              .join("")}`
                        : ""
                }`;
                if (
                    mapParams.speedMultiplier !== 1 ||
                    mapStatistics.isForceAR
                ) {
                    string += " (";
                    if (mapStatistics.isForceAR) {
                        string += `AR${mapStatistics.ar}`;
                    }
                    if (mapParams.speedMultiplier !== 1) {
                        if (mapStatistics.isForceAR) {
                            string += ", ";
                        }
                        string += `${mapParams.speedMultiplier}x`;
                    }
                    string += ")";
                }
                return string;
            }
            case 1: {
                let string: string = `${
                    beatmapInfo.source
                        ? `${bold("Source")}: ${beatmapInfo.source}\n`
                        : ""
                }${hyperlink(
                    "Preview",
                    `https://osu-preview.jmir.ml/preview${beatmapInfo.beatmapsetID}`
                )}\n${bold("Download")}: ${hyperlink(
                    "osu!",
                    `https://osu.ppy.sh/d/${beatmapInfo.beatmapsetID}`
                )}${
                    beatmapInfo.videoAvailable
                        ? ` ${hyperlink(
                              "(no video)",
                              `https://osu.ppy.sh/d/${beatmapInfo.beatmapsetID}n`
                          )}`
                        : ""
                } - ${hyperlink(
                    "Chimu",
                    `https://chimu.moe/en/d/${beatmapInfo.beatmapsetID}`
                )} - ${hyperlink(
                    "Sayobot",
                    `https://txy1.sayobot.cn/beatmaps/download/full/${beatmapInfo.beatmapsetID}`
                )}${
                    beatmapInfo.videoAvailable
                        ? ` ${hyperlink(
                              "(no video)",
                              `https://txy1.sayobot.cn/beatmaps/download/novideo/${beatmapInfo.beatmapsetID}`
                          )}`
                        : ""
                } - ${hyperlink(
                    "Beatconnect",
                    `https://beatconnect.io/b/${beatmapInfo.beatmapsetID}/`
                )} - ${hyperlink(
                    "Nerina",
                    `https://nerina.pw/d/${beatmapInfo.beatmapsetID}`
                )}${
                    beatmapInfo.approved >= RankedStatus.ranked &&
                    beatmapInfo.approved !== RankedStatus.qualified
                        ? ` - ${hyperlink(
                              "Ripple",
                              `https://storage.ripple.moe/d/${beatmapInfo.beatmapsetID}`
                          )}`
                        : ""
                }`;
                if (beatmapInfo.packs.length > 0) {
                    string += `\n${bold("Beatmap Pack")}: `;
                    for (let i = 0; i < beatmapInfo.packs.length; i++) {
                        string += hyperlink(
                            beatmapInfo.packs[i],
                            `https://osu.ppy.sh/beatmaps/packs/${beatmapInfo.packs[i]}`
                        );
                        if (i + 1 < beatmapInfo.packs.length) {
                            string += " - ";
                        }
                    }
                }
                string += `\n🖼️ ${
                    beatmapInfo.storyboardAvailable ? "✅" : "❎"
                } **|** 🎞️ ${beatmapInfo.videoAvailable ? "✅" : "❎"}`;
                return string;
            }
            case 2:
                return `${bold("Circles")}: ${beatmapInfo.circles} - ${bold(
                    "Sliders"
                )}: ${beatmapInfo.sliders} - ${bold("Spinners")}: ${
                    beatmapInfo.spinners
                }`;
            case 3: {
                const droidOriginalStats: MapStats = new MapStats({
                    cs: beatmapInfo.cs,
                    ar: beatmapInfo.ar,
                    od: beatmapInfo.od,
                    hp: beatmapInfo.hp,
                }).calculate({ mode: Modes.droid });

                const droidModifiedStats: MapStats = new MapStats(
                    mapParams
                ).calculate({ mode: Modes.droid });

                droidOriginalStats.cs = MathUtils.round(
                    droidOriginalStats.cs!,
                    2
                );
                droidOriginalStats.ar = MathUtils.round(
                    droidOriginalStats.ar!,
                    2
                );
                droidOriginalStats.od = MathUtils.round(
                    droidOriginalStats.od!,
                    2
                );
                droidOriginalStats.hp = MathUtils.round(
                    droidOriginalStats.hp!,
                    2
                );

                droidModifiedStats.cs = MathUtils.round(
                    droidModifiedStats.cs!,
                    2
                );
                droidModifiedStats.ar = MathUtils.round(
                    droidModifiedStats.ar!,
                    2
                );
                droidModifiedStats.od = MathUtils.round(
                    droidModifiedStats.od!,
                    2
                );
                droidModifiedStats.hp = MathUtils.round(
                    droidModifiedStats.hp!,
                    2
                );

                const maxScore: number =
                    beatmapInfo.beatmap?.maxDroidScore(
                        new MapStats(mapParams)
                    ) ?? 0;

                return `${bold("CS")}: ${droidOriginalStats.cs}${
                    Precision.almostEqualsNumber(
                        droidOriginalStats.cs!,
                        droidModifiedStats.cs!
                    )
                        ? ""
                        : ` (${droidModifiedStats.cs})`
                } - ${bold("AR")}: ${droidOriginalStats.ar}${
                    Precision.almostEqualsNumber(
                        droidOriginalStats.ar!,
                        droidModifiedStats.ar!
                    )
                        ? ""
                        : ` (${droidModifiedStats.ar})`
                } - ${bold("OD")}: ${droidOriginalStats.od}${
                    Precision.almostEqualsNumber(
                        droidOriginalStats.od!,
                        droidModifiedStats.od!
                    )
                        ? ""
                        : ` (${droidModifiedStats.od})`
                } - ${bold("HP")}: ${droidOriginalStats.hp}${
                    Precision.almostEqualsNumber(
                        droidOriginalStats.hp!,
                        droidModifiedStats.hp!
                    )
                        ? ""
                        : ` (${droidModifiedStats.hp})`
                }${
                    maxScore > 0
                        ? `\n${bold("Max Score")}: ${maxScore.toLocaleString()}`
                        : ""
                }`;
            }
            case 4: {
                const mapStatistics: MapStats = new MapStats(
                    mapParams
                ).calculate();

                mapStatistics.cs = MathUtils.round(mapStatistics.cs!, 2);
                mapStatistics.ar = MathUtils.round(mapStatistics.ar!, 2);
                mapStatistics.od = MathUtils.round(mapStatistics.od!, 2);
                mapStatistics.hp = MathUtils.round(mapStatistics.hp!, 2);

                const maxScore: number =
                    beatmapInfo.beatmap?.maxOsuScore(mapStatistics.mods) ?? 0;

                return `${bold("CS")}: ${beatmapInfo.cs}${
                    Precision.almostEqualsNumber(
                        beatmapInfo.cs,
                        mapStatistics.cs!
                    )
                        ? ""
                        : ` (${mapStatistics.cs})`
                } - ${bold("AR")}: ${beatmapInfo.ar}${
                    Precision.almostEqualsNumber(
                        beatmapInfo.ar,
                        mapStatistics.ar!
                    )
                        ? ""
                        : ` (${mapStatistics.ar})`
                } - ${bold("OD")}: ${beatmapInfo.od}${
                    Precision.almostEqualsNumber(
                        beatmapInfo.od,
                        mapStatistics.od!
                    )
                        ? ""
                        : ` (${mapStatistics.od})`
                } - ${bold("HP")}: ${beatmapInfo.hp}${
                    Precision.almostEqualsNumber(
                        beatmapInfo.hp,
                        mapStatistics.hp!
                    )
                        ? ""
                        : ` (${mapStatistics.hp})`
                }${
                    maxScore > 0
                        ? `\n${bold("Max Score")}: ${maxScore.toLocaleString()}`
                        : ""
                }`;
            }
            case 5: {
                const mapStatistics: MapStats = new MapStats(
                    mapParams
                ).calculate();

                const convertedBPM: number = this.convertBPM(
                    beatmapInfo.bpm,
                    mapStatistics
                );
                let string = `${bold("BPM")}: `;
                if (beatmapInfo.beatmap) {
                    const uninheritedTimingPoints: readonly TimingControlPoint[] =
                        beatmapInfo.beatmap.controlPoints.timing.points;

                    if (uninheritedTimingPoints.length === 1) {
                        string += `${beatmapInfo.bpm}${
                            !Precision.almostEqualsNumber(
                                beatmapInfo.bpm,
                                convertedBPM
                            )
                                ? ` (${convertedBPM})`
                                : ""
                        } - ${bold("Length")}: ${this.convertTime(
                            beatmapInfo.hitLength,
                            beatmapInfo.totalLength,
                            mapStatistics
                        )} - ${bold("Max Combo")}: ${beatmapInfo.maxCombo}x`;
                    } else {
                        let maxBPM: number = beatmapInfo.bpm;
                        let minBPM: number = beatmapInfo.bpm;
                        for (const t of uninheritedTimingPoints) {
                            const bpm: number = parseFloat(
                                (60000 / t.msPerBeat).toFixed(2)
                            );
                            maxBPM = Math.max(maxBPM, bpm);
                            minBPM = Math.min(minBPM, bpm);
                        }
                        maxBPM = Math.round(maxBPM);
                        minBPM = Math.round(minBPM);
                        const speedMulMinBPM: number = Math.round(
                            minBPM * mapStatistics.speedMultiplier
                        );
                        const speedMulMaxBPM: number = Math.round(
                            maxBPM * mapStatistics.speedMultiplier
                        );

                        string +=
                            Precision.almostEqualsNumber(
                                minBPM,
                                beatmapInfo.bpm
                            ) &&
                            Precision.almostEqualsNumber(
                                maxBPM,
                                beatmapInfo.bpm
                            )
                                ? `${beatmapInfo.bpm} `
                                : `${minBPM}-${maxBPM} (${beatmapInfo.bpm}) `;

                        if (
                            !Precision.almostEqualsNumber(
                                beatmapInfo.bpm,
                                convertedBPM
                            )
                        ) {
                            if (
                                !Precision.almostEqualsNumber(
                                    speedMulMinBPM,
                                    speedMulMaxBPM
                                )
                            ) {
                                string += `(${speedMulMinBPM}-${speedMulMaxBPM} (${convertedBPM})) `;
                            } else {
                                string += `(${convertedBPM}) `;
                            }
                        }

                        string += `- ${bold("Length")}: ${this.convertTime(
                            beatmapInfo.hitLength,
                            beatmapInfo.totalLength,
                            mapStatistics
                        )} - ${bold("Max Combo")}: ${beatmapInfo.maxCombo}x`;
                    }
                } else {
                    string += `${beatmapInfo.bpm}${
                        !Precision.almostEqualsNumber(
                            beatmapInfo.bpm,
                            convertedBPM
                        )
                            ? ` (${convertedBPM})`
                            : ""
                    } - ${bold("Length")}: ${this.convertTime(
                        beatmapInfo.hitLength,
                        beatmapInfo.totalLength,
                        mapStatistics
                    )} - ${bold("Max Combo")}: ${beatmapInfo.maxCombo}x`;
                }
                return string;
            }
            case 6:
                return `${bold(
                    "Last Update"
                )}: ${beatmapInfo.lastUpdate.toUTCString()} | ${bold(
                    this.convertStatus(beatmapInfo.approved)
                )}`;
            case 7:
                return `❤️ ${bold(
                    beatmapInfo.favorites.toLocaleString()
                )} - ▶️ ${bold(beatmapInfo.plays.toLocaleString())}`;
            default:
                throw {
                    name: "NotSupportedError",
                    message: `This mode (${option}) is not supported`,
                };
        }
    }

    /**
     * Returns a color integer based on the beatmap's ranking status.
     *
     * Useful to make embed messages.
     */
    static getStatusColor(status: RankedStatus): ColorResolvable {
        switch (status) {
            case RankedStatus.graveyard:
                return 16711711; // Graveyard: red
            case RankedStatus.wip:
                return 9442302; // WIP: purple
            case RankedStatus.pending:
                return 16312092; // Pending: yellow
            case RankedStatus.ranked:
                return 2483712; // Ranked: green
            case RankedStatus.approved:
                return 16741376; // Approved: tosca
            case RankedStatus.qualified:
                return 5301186; // Qualified: light blue
            case RankedStatus.loved:
                return 16711796; // Loved: pink
            default:
                return 0;
        }
    }

    /**
     * Converts the beatmap's BPM if speed-changing mods are applied.
     */
    static convertBPM(bpm: number, stats: MapStats): number {
        bpm *= stats.speedMultiplier;

        return parseFloat(bpm.toFixed(2));
    }

    /**
     * Converts the beatmap's status into a string.
     */
    private static convertStatus(status: RankedStatus): string {
        let s: keyof typeof RankedStatus = "approved";
        for (const stat in RankedStatus) {
            if (RankedStatus[<keyof typeof RankedStatus>stat] === status) {
                s = <keyof typeof RankedStatus>stat;
                break;
            }
        }
        return s !== "wip"
            ? s.charAt(0).toUpperCase() + s.slice(1)
            : s.toUpperCase();
    }

    /**
     * Converts the beatmap's length if speed-changing mods are applied.
     */
    static convertTime(
        hitLength: number,
        totalLength: number,
        stats: MapStats
    ): string {
        hitLength /= stats.speedMultiplier;
        totalLength /= stats.speedMultiplier;

        return `${this.timeString(hitLength)}${
            hitLength === hitLength ? "" : ` (${this.timeString(hitLength)})`
        }/${this.timeString(totalLength)}${
            totalLength === totalLength
                ? ""
                : ` (${this.timeString(totalLength)})`
        }`;
    }

    /**
     * Time string parsing function for statistics utility.
     */
    private static timeString(second: number): string {
        let str: string = new Date(1000 * Math.ceil(second))
            .toISOString()
            .substr(11, 8)
            .replace(/^[0:]+/, "");

        if (second < 60) {
            str = "0:" + str;
        }

        return str;
    }
}
