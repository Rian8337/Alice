import request from 'request';
import { modes } from '../constants/modes';
import { Beatmap } from '../beatmap/Beatmap';
import { MapStats } from '../utils/MapStats';
import { Parser } from '../beatmap/Parser';
import { rankedStatus } from '../constants/rankedStatus';
import { HitObject } from '../beatmap/hitobjects/HitObject';
import { Slider } from '../beatmap/hitobjects/Slider';
import { SliderTick } from '../beatmap/hitobjects/sliderObjects/SliderTick';
import { DroidAPIRequestBuilder, OsuAPIRequestBuilder, RequestResponse } from '../utils/APIRequestBuilder';
import { Precision } from '../utils/Precision';
import { TimingControlPoint } from '../beatmap/timings/TimingControlPoint';
import { Score } from '../osu!droid/Score';
import { Mod } from '../mods/Mod';
import { Utils } from '../utils/Utils';

interface OsuAPIResponse {
    readonly approved: string;
    readonly submit_date: string;
    readonly approved_date: string;
    readonly last_update: string;
    readonly artist: string;
    readonly beatmap_id: string;
    readonly beatmapset_id: string;
    readonly bpm: string;
    readonly creator: string;
    readonly creator_id: string;
    readonly difficultyrating?: string;
    readonly diff_aim?: string;
    readonly diff_speed?: string;
    readonly diff_size: string;
    readonly diff_overall: string;
    readonly diff_approach: string;
    readonly diff_drain: string;
    readonly hit_length: string;
    readonly source: string;
    readonly genre_id: string;
    readonly language_id: string;
    readonly title: string;
    readonly total_length: string;
    readonly version: string;
    readonly file_md5: string;
    readonly mode: string;
    readonly tags: string;
    readonly favourite_count: string;
    readonly rating: string;
    readonly playcount: string;
    readonly passcount: string;
    readonly count_normal: string;
    readonly count_slider: string;
    readonly count_spinner: string;
    readonly max_combo: string;
    readonly storyboard: string;
    readonly video: string;
    readonly download_unavailable: string;
    readonly audio_unavailable: string;
    readonly packs?: string;
}

/**
 * Represents a beatmap with general information.
 */
export class MapInfo {
    /**
     * The title of the song of the beatmap.
     */
    title: string = "";

    /**
     * The full title of the beatmap, which is `Artist - Title (Creator) [Difficulty Name]`.
     */
    get fullTitle(): string {
        return `${this.artist} - ${this.title} (${this.creator}) [${this.version}]`;
    }

    /**
     * The artist of the song of the beatmap.
     */
    artist: string = "";

    /**
     * The creator of the beatmap.
     */
    creator: string = "";

    /**
     * The difficulty name of the beatmap.
     */
    version: string = "";

    /**
     * The source of the song, if any.
     */
    source: string = "";

    /**
     * The ranking status of the beatmap.
     */
    approved: rankedStatus = 0;

    /**
     * The ID of the beatmap.
     */
    beatmapID: number = 0;

    /**
     * The ID of the beatmapset containing the beatmap.
     */
    beatmapsetID: number = 0;

    /**
     * The amount of times the beatmap has been played.
     */
    plays: number = 0;

    /**
     * The amount of times the beatmap has been favorited.
     */
    favorites: number = 0;

    /**
     * The date of which the beatmap was submitted.
     */
    submitDate: Date = new Date(0);

    /**
     * The date of which the beatmap was last updated.
     */
    lastUpdate: Date = new Date(0);

    /**
     * The duration of the beatmap not including breaks.
     */
    hitLength: number = 0;

    /**
     * The duration of the beatmap including breaks.
     */
    totalLength: number = 0;

    /**
     * The BPM of the beatmap.
     */
    bpm: number = 0;

    /**
     * The amount of circles in the beatmap.
     */
    circles: number = 0;

    /**
     * The amount of sliders in the beatmap.
     */
    sliders: number = 0;

    /**
     * The amount of spinners in the beatmap.
     */
    spinners: number = 0;

    /**
     * The amount of objects in the beatmap.
     */
    objects: number = 0;

    /**
     * The maximum combo of the beatmap.
     */
    maxCombo: number = 0;

    /**
     * The circle size of the beatmap.
     */
    cs: number = 0;

    /**
     * The approach rate of the beatmap.
     */
    ar: number = 0;

    /**
     * The overall difficulty of the beatmap.
     */
    od: number = 0;

    /**
     * The health drain rate of the beatmap.
     */
    hp: number = 0;

    /**
     * The beatmap packs that contain this beatmap, represented by their ID.
     */
    packs: string[] = [];

    /**
     * The aim difficulty rating of the beatmap.
     */
    aimDifficulty: number = 0;

    /**
     * The speed difficulty rating of the beatmap.
     */
    speedDifficulty: number = 0;

    /**
     * The generic difficulty rating of the beatmap.
     */
    totalDifficulty: number = 0;

    /**
     * The MD5 hash of the beatmap.
     */
    hash: string = "";

    /**
     * Whether or not this beatmap has a storyboard.
     */
    storyboardAvailable: boolean = false;

    /**
     * Whether or not this beatmap has a video.
     */
    videoAvailable: boolean = false;

    /**
     * The parsed beatmap from beatmap parser.
     */
    get map(): Beatmap | undefined {
        return Utils.deepCopy(this.cachedBeatmap);
    }

    private cachedBeatmap?: Beatmap;

    /**
     * Retrieve a beatmap's general information.
     * 
     * Either beatmap ID or MD5 hash of the beatmap must be specified. If both are specified, beatmap ID is taken.
     */
    static getInformation(params: {
        /**
         * The ID of the beatmap.
         */
        beatmapID?: number,

        /**
         * The MD5 hash of the beatmap.
         */
        hash?: string,

        /**
         * Whether or not to also retrieve the .osu file of the beatmap (required for some utilities). Defaults to `true`.
         */
        file?: boolean
    }): Promise<MapInfo> {
        return new Promise(async (resolve, reject) => {
            if (params.file === undefined) {
                params.file = true;
            }

            const beatmapID: number | undefined = params.beatmapID;
            const hash: string | undefined = params.hash;

            if (!beatmapID && !hash) {
                throw new Error("Beatmap ID or MD5 hash must be defined");
            }

            const apiRequestBuilder: OsuAPIRequestBuilder = new OsuAPIRequestBuilder()
                .setEndpoint("get_beatmaps");
            if (beatmapID) {
                apiRequestBuilder.addParameter("b", beatmapID);
            } else if (hash) {
                apiRequestBuilder.addParameter("h", hash);
            }

            const map: MapInfo = new MapInfo();
            const result: RequestResponse = await apiRequestBuilder.sendRequest();
            if (result.statusCode !== 200) {
                return reject("API error");
            }
            const mapinfo: OsuAPIResponse = JSON.parse(result.data.toString("utf-8"))[0];
            if (!mapinfo) {
                return resolve(map);
            }
            if (parseInt(mapinfo.mode) !== 0) {
                return resolve(map);
            }

            map.fillMetadata(mapinfo);

            if (params.file) {
                await map.retrieveBeatmapFile();
            }

            resolve(map);
        });
    }

    /**
     * Fills the current instance with map data.
     * 
     * @param mapinfo The map data.
     */
    fillMetadata(mapinfo: OsuAPIResponse): MapInfo {
        this.title = mapinfo.title;
        this.artist = mapinfo.artist;
        this.creator = mapinfo.creator;
        this.version = mapinfo.version;
        this.source = mapinfo.source;
        this.approved = parseInt(mapinfo.approved);
        this.beatmapID = parseInt(mapinfo.beatmap_id);
        this.beatmapsetID = parseInt(mapinfo.beatmapset_id);
        this.plays = parseInt(mapinfo.playcount);
        this.favorites = parseInt(mapinfo.favourite_count);
        const t: number[] = mapinfo.last_update.split(/[- :]/).map(e => parseInt(e));
        this.lastUpdate = new Date(Date.UTC(t[0], t[1] - 1, t[2], t[3], t[4], t[5]));
        const s: number[] = mapinfo.submit_date.split(/[- :]/).map(e => parseInt(e));
        this.submitDate = new Date(Date.UTC(s[0], s[1] - 1, s[2], s[3], s[4], s[5]));
        this.hitLength = parseInt(mapinfo.hit_length);
        this.totalLength = parseInt(mapinfo.total_length);
        this.bpm = parseFloat(mapinfo.bpm);
        this.circles = mapinfo.count_normal ? parseInt(mapinfo.count_normal) : 0;
        this.sliders = mapinfo.count_slider ? parseInt(mapinfo.count_slider) : 0;
        this.spinners = mapinfo.count_spinner ? parseInt(mapinfo.count_spinner) : 0;
        this.objects = this.circles + this.sliders + this.spinners;
        this.maxCombo = parseInt(mapinfo.max_combo);
        this.cs = parseFloat(mapinfo.diff_size);
        this.ar = parseFloat(mapinfo.diff_approach);
        this.od = parseFloat(mapinfo.diff_overall);
        this.hp = parseFloat(mapinfo.diff_drain);
        if (mapinfo.packs) {
            this.packs = mapinfo.packs.split(",").map(pack => pack.trim());
        }
        this.aimDifficulty = mapinfo.diff_aim ? parseFloat(mapinfo.diff_aim) : 0;
        this.speedDifficulty = mapinfo.diff_speed ? parseFloat(mapinfo.diff_speed) : 0;
        this.totalDifficulty = mapinfo.difficultyrating ? parseFloat(mapinfo.difficultyrating) : 0;
        this.hash = mapinfo.file_md5;
        this.storyboardAvailable = !!parseInt(mapinfo.storyboard);
        this.videoAvailable = !!parseInt(mapinfo.video);
        return this;
    }

    /**
     * Retrieves the .osu file of the beatmap.
     * 
     * @param forceDownload Whether or not to download the file regardless if it's already available.
     */
    retrieveBeatmapFile(forceDownload?: boolean): Promise<MapInfo> {
        return new Promise(resolve => {
            if (this.cachedBeatmap && !forceDownload) {
                return resolve(this);
            }

            const url: string = `https://osu.ppy.sh/osu/${this.beatmapID}`;
            const dataArray: Buffer[] = [];
            request(url, { timeout: 10000 })
                .on("data", chunk => {
                    dataArray.push(Buffer.from(chunk));
                })
                .on("complete", response => {
                    if (response.statusCode !== 200) {
                        return resolve(this);
                    }
                    this.cachedBeatmap = new Parser().parse(Buffer.concat(dataArray).toString("utf8")).map;
                    resolve(this);
                });
        });
    }

    /**
     * Converts the beatmap's BPM if speed-changing mods are applied.
     */
    convertBPM(stats: MapStats): number {
        let bpm: number = this.bpm;
        bpm *= stats.speedMultiplier;

        return parseFloat(bpm.toFixed(2));
    }
    /**
     * Converts the beatmap's status into a string.
     */
    convertStatus(): string {
        let status: string = "Unknown";
        for (const stat in rankedStatus) {
            if (rankedStatus[stat as keyof typeof rankedStatus] === this.approved) {
                status = stat;
                break;
            }
        }
        return status !== "WIP" ? status.charAt(0) + status.slice(1).toLowerCase() : status;
    }

    /**
     * Converts the beatmap's length if speed-changing mods are applied.
     */
    convertTime(stats: MapStats): string {
        let hitLength: number = this.hitLength;
        let totalLength: number = this.totalLength;

        hitLength /= stats.speedMultiplier;
        totalLength /= stats.speedMultiplier;

        return `${this.timeString(this.hitLength)}${this.hitLength === hitLength ? "" : ` (${this.timeString(hitLength)})`}/${this.timeString(this.totalLength)}${this.totalLength === totalLength ? "" : ` (${this.timeString(totalLength)})`}`;
    }

    /**
     * Time string parsing function for statistics utility.
     */
    private timeString(second: number): string {
        let str: string = new Date(1000 * Math.ceil(second)).toISOString().substr(11, 8).replace(/^[0:]+/, "");

        if (second < 60) {
            str = "0:" + str;
        }

        return str;
    }

    /**
     * Shows the beatmap's statistics based on applied mods and option.
     * 
     * - Option `0`: return map title and mods used if defined
     * - Option `1`: return song source and map download link to beatmap mirrors
     * - Option `2`: return CS, AR, OD, HP
     * - Option `3`: return BPM, map length, max combo
     * - Option `4`: return last update date and map status
     * - Option `5`: return favorite count and play count
     */
    showStatistics(option: number, mod?: Mod[], stats?: MapStats): string {
        const mapParams = {
            cs: this.cs,
            ar: this.ar,
            od: this.od,
            hp: this.hp,
            mods: mod,
            isForceAR: false,
            speedMultiplier: 1
        };
        if (stats) {
            mapParams.ar = stats.ar ?? mapParams.ar;
            mapParams.isForceAR = stats.isForceAR ?? mapParams.isForceAR;
            mapParams.speedMultiplier = stats.speedMultiplier ?? mapParams.speedMultiplier;
        }
        const mapStatistics: MapStats = new MapStats(mapParams).calculate({ mode: modes.osu });
        mapStatistics.cs = parseFloat((mapStatistics.cs as number).toFixed(2));
        mapStatistics.ar = parseFloat((mapStatistics.ar as number).toFixed(2));
        mapStatistics.od = parseFloat((mapStatistics.od as number).toFixed(2));
        mapStatistics.hp = parseFloat((mapStatistics.hp as number).toFixed(2));

        switch (option) {
            case 0: {
                let string: string = `${this.fullTitle}${(mod?.length ?? 0) > 0 ? ` +${mod?.map(m => m.acronym).join("")}` : ""}`;
                if (mapParams.speedMultiplier !== 1 || mapStatistics.isForceAR) {
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
                let string: string = `${this.source ? `**Source**: ${this.source}\n` : ""}**Download**: [osu!](https://osu.ppy.sh/d/${this.beatmapsetID})${this.videoAvailable ? ` [(no video)](https://osu.ppy.sh/d/${this.beatmapsetID}n)` : ""} - [Chimu](https://chimu.moe/en/d/${this.beatmapsetID}) - [Sayobot](https://txy1.sayobot.cn/beatmaps/download/full/${this.beatmapsetID})${this.videoAvailable ? ` [(no video)](https://txy1.sayobot.cn/beatmaps/download/novideo/${this.beatmapsetID})` : ""} - [Beatconnect](https://beatconnect.io/b/${this.beatmapsetID}/) - [Nerina](https://nerina.pw/d/${this.beatmapsetID})${this.approved >= rankedStatus.RANKED && this.approved !== rankedStatus.QUALIFIED ? ` - [Ripple](https://storage.ripple.moe/d/${this.beatmapsetID})` : ""}`;
                if (this.packs.length > 0) {
                    string += '\n**Beatmap Pack**: ';
                    for (let i = 0; i < this.packs.length; i++) {
                        string += `[${this.packs[i]}](https://osu.ppy.sh/beatmaps/packs/${this.packs[i]})`;
                        if (i + 1 < this.packs.length) {
                            string += ' - ';
                        }
                    }
                }
                string += `\n🖼️ ${this.storyboardAvailable ? "✅" : "❎"} **|** 🎞️ ${this.videoAvailable ? "✅" : "❎"}`;
                return string;
            }
            case 2: return `**Circles**: ${this.circles} - **Sliders**: ${this.sliders} - **Spinners**: ${this.spinners}\n**CS**: ${this.cs}${this.cs === mapStatistics.cs ? "" : ` (${mapStatistics.cs})`} - **AR**: ${this.ar}${this.ar === mapStatistics.ar ? "" : ` (${mapStatistics.ar})`} - **OD**: ${this.od}${this.od === mapStatistics.od ? "" : ` (${mapStatistics.od})`} - **HP**: ${this.hp}${this.hp === mapStatistics.hp ? "" : ` (${mapStatistics.hp})`}`;
            case 3: {
                const maxScore: number = this.maxScore(mapStatistics);
                const convertedBPM: number = this.convertBPM(mapStatistics);
                let string = "**BPM**: ";
                if (this.map) {
                    const uninheritedTimingPoints: TimingControlPoint[] = this.map.timingPoints;

                    if (uninheritedTimingPoints.length === 1) {
                        string += `${this.bpm}${!Precision.almostEqualsNumber(this.bpm, convertedBPM) ? ` (${convertedBPM})` : ""} - **Length**: ${this.convertTime(mapStatistics)} - **Max Combo**: ${this.maxCombo}x${maxScore > 0 ? `\n**Max Score**: ${maxScore.toLocaleString()}` : ""}`;
                    } else {
                        let maxBPM: number = this.bpm;
                        let minBPM: number = this.bpm;
                        for (const t of uninheritedTimingPoints) {
                            const bpm: number = parseFloat((60000 / t.msPerBeat).toFixed(2));
                            maxBPM = Math.max(maxBPM, bpm);
                            minBPM = Math.min(minBPM, bpm);
                        }
                        maxBPM = Math.round(maxBPM);
                        minBPM = Math.round(minBPM);
                        const speedMulMinBPM: number = Math.round(minBPM * mapStatistics.speedMultiplier);
                        const speedMulMaxBPM: number = Math.round(maxBPM * mapStatistics.speedMultiplier);

                        string +=
                            Precision.almostEqualsNumber(minBPM, this.bpm) && Precision.almostEqualsNumber(maxBPM, this.bpm) ?
                                `${this.bpm} ` : `${minBPM}-${maxBPM} (${this.bpm}) `;

                        if (!Precision.almostEqualsNumber(this.bpm, convertedBPM)) {
                            if (!Precision.almostEqualsNumber(speedMulMinBPM, speedMulMaxBPM)) {
                                string += `(${speedMulMinBPM}-${speedMulMaxBPM} (${convertedBPM})) `;
                            } else {
                                string += `(${convertedBPM}) `;
                            }
                        }

                        string += `- **Length**: ${this.convertTime(mapStatistics)} - **Max Combo**: ${this.maxCombo}x${maxScore > 0 ? `\n**Max score**: ${maxScore.toLocaleString()}` : ""}`;
                    }
                } else {
                    string += `**BPM**: ${this.convertBPM(mapStatistics)} - **Length**: ${this.convertTime(mapStatistics)} - **Max Combo**: ${this.maxCombo}x${maxScore > 0 ? `\n**Max score**: ${maxScore.toLocaleString()}` : ""}`;
                }
                return string;
            }
            case 4: return `**Last Update**: ${this.lastUpdate.toUTCString()} | **${this.convertStatus()}**`;
            case 5: return `❤️ **${this.favorites.toLocaleString()}** - ▶️ **${this.plays.toLocaleString()}**`;
            default: throw {
                name: "NotSupportedError",
                message: `This mode (${option}) is not supported`
            }
        }
    }

    /**
     * Returns a color integer based on the beatmap's ranking status.
     * 
     * Useful to make embed messages.
     */
    get statusColor(): number {
        switch (this.approved) {
            case -2: return 16711711; // Graveyard: red
            case -1: return 9442302; // WIP: purple
            case 0: return 16312092; // Pending: yellow
            case 1: return 2483712; // Ranked: green
            case 2: return 16741376; // Approved: tosca
            case 3: return 5301186; // Qualified: light blue
            case 4: return 16711796; // Loved: pink
            default: return 0;
        }
    }

    /**
     * Calculates the osu!droid maximum score of the beatmap.
     * 
     * This requires .osu file to be downloaded.
     */
    maxScore(stats: MapStats): number {
        if (!this.map) {
            return 0;
        }

        const difficultyMultiplier: number = 1 + this.od / 10 + this.hp / 10 + (this.cs - 3) / 4;

        // score multiplier
        let scoreMultiplier: number = 1;

        if (stats.mods.every(m => m.droidRanked)) {
            let scoreSpeedMultiplier: number = 1;
            const speedMultiplier: number = stats.speedMultiplier;
            if (speedMultiplier > 1) {
                scoreSpeedMultiplier += (speedMultiplier - 1) * 0.24;
            } else if (speedMultiplier < 1) {
                scoreSpeedMultiplier = Math.pow(0.3, (1 - speedMultiplier) * 4);
            }
            scoreMultiplier = stats.mods.reduce((a, v) => a * v.scoreMultiplier, 1) * scoreSpeedMultiplier;
        } else {
            scoreMultiplier = 0;
        }

        const objects: HitObject[] = this.map.objects;
        let combo: number = 0;
        let score: number = 0;

        for (let i = 0; i < objects.length; ++i) {
            const object: HitObject = objects[i];
            if (!(object instanceof Slider)) {
                score += Math.floor(300 + 300 * combo * difficultyMultiplier * scoreMultiplier / 25);
                ++combo;
                continue;
            }

            const tickCount: number = object.nestedHitObjects.filter(v => v instanceof SliderTick).length;

            // Apply sliderhead, slider repeats, and slider ticks
            score += 30 * object.repetitions + 10 * tickCount;
            combo += tickCount + object.repetitions;
            // Apply sliderend
            score += Math.floor(300 + 300 * combo * difficultyMultiplier * scoreMultiplier / 25);
            ++combo;
        }
        return score;
    }

    /**
     * Fetches the droid leaderboard of the beatmap.
     * 
     * The scores are sorted based on score.
     * 
     * @param page The page of the leaderboard to fetch. Each page contains at most 100 scores. If unspecified, defaults to the first page.
     */
    fetchDroidLeaderboard(page?: number): Promise<Score[]> {
        return new Promise(async resolve => {
            const apiRequestBuilder: DroidAPIRequestBuilder = new DroidAPIRequestBuilder()
                .setEndpoint("scoresearchv2.php")
                .addParameter("hash", this.hash)
                .addParameter("page", Math.max(0, (page ?? 1) - 1))
                .addParameter("order", "score");

            const result: RequestResponse = await apiRequestBuilder.sendRequest();

            const data: string[] = result.data.toString("utf-8").split("<br>");

            data.shift();

            resolve(data.map(v => new Score().fillInformation(v)));
        });
    }

    /**
     * Returns a string representative of the class.
     */
    toString(): string {
        return `${this.fullTitle}\nCS: ${this.cs} - AR: ${this.ar} - OD: ${this.od} - HP: ${this.hp}\nBPM: ${this.bpm} - Length: ${this.hitLength}/${this.totalLength} - Max Combo: ${this.maxCombo}\nLast Update: ${this.lastUpdate}`;
    }
}