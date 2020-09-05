import * as request from 'request';
import { mods } from './mods';
import { modes } from '../constants/modes';
import { Beatmap } from '../beatmap/Beatmap';
import { MapStats } from './MapStats';
import { Parser } from './Parser';
import { rankedStatus } from '../constants/rankedStatus';
import { HitObject } from '../beatmap/hitobjects/HitObject';
import { TimingPoint } from '../beatmap/timings/TimingPoint';
import { Slider } from '../beatmap/hitobjects/Slider';
import { config } from 'dotenv';
config();
const apikey: string = process.env.OSU_API_KEY as string;

interface OsuAPIResponse {
    approved: string;
    submit_date: string;
    approved_date: string;
    last_update: string;
    artist: string;
    beatmap_id: string;
    beatmapset_id: string;
    bpm: string;
    creator: string;
    creator_id: string;
    difficultyrating?: string;
    diff_aim?: string;
    diff_speed?: string;
    diff_size: string;
    diff_overall: string;
    diff_approach: string;
    diff_drain: string;
    hit_length: string;
    source: string;
    genre_id: string;
    language_id: string;
    title: string;
    total_length: string;
    version: string;
    file_md5: string;
    mode: string;
    tags: string;
    favourite_count: string;
    rating: string;
    playcount: string;
    passcount: string;
    count_normal: string;
    count_slider: string;
    count_spinner: string;
    max_combo: string;
    storyboard: string;
    video: string;
    download_unavailable: string;
    audio_unavailable: string;
    packs?: string;
}

/**
 * Represents a beatmap with general information.
 */
export class MapInfo {
    /**
     * The title of the song of the beatmap.
     */
    public title: string;

    /**
     * The full title of the beatmap, which is `Artist - Title (Creator) [Difficulty Name]`.
     */
    public fullTitle: string;

    /**
     * The artist of the song of the beatmap.
     */
    public artist: string;

    /**
     * The creator of the beatmap.
     */
    public creator: string;

    /**
     * The difficulty name of the beatmap.
     */
    public version: string;

    /**
     * The ranking status of the beatmap.
     */
    public approved: rankedStatus;

    /**
     * The ID of the beatmap.
     */
    public beatmapID: number;

    /**
     * The ID of the beatmapset containing the beatmap.
     */
    public beatmapsetID: number;

    /**
     * The amount of times the beatmap has been played.
     */
    public plays: number;

    /**
     * The amount of times the beatmap has been favorited.
     */
    public favorites: number;

    /**
     * The date of which the beatmap was submitted.
     */
    public submitDate: Date;

    /**
     * The date of which the beatmap was last updated.
     */
    public lastUpdate: Date;

    /**
     * The duration of the beatmap not including breaks.
     */
    public hitLength: number;

    /**
     * The duration of the beatmap including breaks.
     */
    public totalLength: number;

    /**
     * The BPM of the beatmap.
     */
    public bpm: number;

    /**
     * The amount of circles in the beatmap.
     */
    public circles: number;

    /**
     * The amount of sliders in the beatmap.
     */
    public sliders: number;

    /**
     * The amount of spinners in the beatmap.
     */
    public spinners: number;

    /**
     * The amount of objects in the beatmap.
     */
    public objects: number;

    /**
     * The maximum combo of the beatmap.
     */
    public maxCombo: number;

    /**
     * The circle size of the beatmap.
     */
    public cs: number;

    /**
     * The approach rate of the beatmap.
     */
    public ar: number;

    /**
     * The overall difficulty of the beatmap.
     */
    public od: number;

    /**
     * The health drain rate of the beatmap.
     */
    public hp: number;

    /**
     * The beatmap packs that contain this beatmap, represented by their ID.
     */
    public packs: string[];

    /**
     * The aim difficulty rating of the beatmap.
     */
    public aimDifficulty: number;

    /**
     * The speed difficulty rating of the beatmap.
     */
    public speedDifficulty: number;

    /**
     * The generic difficulty rating of the beatmap.
     */
    public totalDifficulty: number;

    /**
     * The MD5 hash of the beatmap.
     */
    public hash: string;

    /**
     * The `.osu` file of the beatmap.
     */
    public osuFile: string;

    /**
     * The parsed beatmap from beatmap parser.
     */
    public map?: Beatmap;

    /**
     * Whether or not the fetch result from `getInformation()` returns an error. This should be immediately checked after calling said method.
     */
    public error: boolean;

    constructor() {
        this.title = "";
        this.fullTitle = "";
        this.artist = "";
        this.creator = "";
        this.version = "";
        this.approved = 0;
        this.beatmapID = 0;
        this.beatmapsetID = 0;
        this.plays = 0;
        this.favorites = 0;
        this.submitDate = new Date(0);
        this.lastUpdate = new Date(0);
        this.hitLength = 0;
        this.totalLength = 0;
        this.bpm = 0;
        this.circles = 0;
        this.sliders = 0;
        this.spinners = 0;
        this.objects = 0;
        this.maxCombo = 0;
        this.cs = 0;
        this.ar = 0;
        this.od = 0;
        this.hp = 0;
        this.packs = [];
        this.aimDifficulty = 0;
        this.speedDifficulty = 0;
        this.totalDifficulty = 0;
        this.hash = "";
        this.osuFile = "";
        this.error = false;
    }

    /**
     * Retrieve a beatmap's general information.
     * 
     * Either beatmap ID or MD5 hash of the beatmap must be specified.
     */
    getInformation(params: {
        beatmapID?: number,
        hash?: string,
        file?: boolean
    }): Promise<MapInfo> {
        return new Promise(resolve => {
            if (params.file === undefined) {
                params.file = true;
            }

            const beatmapID: number|undefined = params.beatmapID;
            const hash: string|undefined = params.hash;

            if (!beatmapID && !hash) {
                throw new Error("Beatmap ID or MD5 hash must be defined");
            }

            const options: string = `https://osu.ppy.sh/api/get_beatmaps?k=${apikey}&${beatmapID ? `b=${beatmapID}` : `h=${hash}`}`;

            request(options, (err, response, data) => {
                if (err || response.statusCode !== 200) {
                    console.log("Error retrieving map info");
                    this.error = true;
                    return resolve(this);
                }
                
                const mapinfo: OsuAPIResponse = JSON.parse(data as string)[0];
                if (!mapinfo) {
                    console.log("Map not found");
                    return resolve(this);
                }
                if (parseInt(mapinfo.mode) !== 0) {
                    console.log("Mode not supported");
                    return resolve(this);
                }

                this.fullTitle = `${mapinfo.artist} - ${mapinfo.title} (${mapinfo.creator}) [${mapinfo.version}]`;
                this.title = mapinfo.title;
                this.artist = mapinfo.artist;
                this.creator = mapinfo.creator;
                this.version = mapinfo.version;
                this.approved = parseInt(mapinfo.approved);
                this.beatmapID = parseInt(mapinfo.beatmap_id);
                this.beatmapsetID = parseInt(mapinfo.beatmapset_id);
                this.plays = parseInt(mapinfo.playcount);
                this.favorites = parseInt(mapinfo.favourite_count);
                const t: number[] = mapinfo.last_update.split(/[- :]/).map(parseInt);
                this.lastUpdate = new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]));
                const s: number[] = mapinfo.submit_date.split(/[- :]/).map(parseInt);
                this.submitDate = new Date(Date.UTC(s[0], s[1]-1, s[2], s[3], s[4], s[5]));
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

                if (!params.file) {
                    return resolve(this);
                }

                const url: string = `https://osu.ppy.sh/osu/${this.beatmapID}`;
                const dataArray: Buffer[] = [];
                request(url, {timeout: 10000})
                    .on("data", chunk => {
                        dataArray.push(Buffer.from(chunk));
                    })
                    .on("complete", response => {
                        if (response.statusCode !== 200) {
                            console.log("Error downloading osu file");
                            return resolve(this);
                        }
                        this.osuFile = Buffer.concat(dataArray).toString("utf8");
                        this.map = new Parser().parse(this.osuFile).map;
                        resolve(this);
                    });
            });
        });
    }

    /**
     * Converts the beatmap's BPM if speed-changing mods are applied.
     */
    private convertBPM(mod: string = ""): string {
        let bpm: number = this.bpm;
        if (mod) {
            if (mod.includes("DT")) {
                bpm *= 1.5;
            }
            if (mod.includes("NC")) {
                bpm *= 1.39;
            }
            if (mod.includes("HT")) {
                bpm *= 0.75;
            }
        }
        return `${this.bpm}${this.bpm === bpm ? "" : ` (${bpm.toFixed(2)})`}`;
    }

    /**
     *  Converts the beatmap's status into a string.
     */
    private convertStatus(): string {
        let status: string = "Unknown";
        for (const stat in rankedStatus) {
            if (rankedStatus[stat as keyof typeof rankedStatus] === this.approved) {
                status = stat;
                break;
            }
        }
        return status.charAt(0) + status.slice(1).toLowerCase();
    }

    /**
     * Converts the beatmap's length if speed-changing mods are applied.
     */
    private convertTime(mod: string = ""): string {
        let hitLength: number = this.hitLength;
        let totalLength: number = this.totalLength;

        if (mod) {
            if (mod.includes("DT")) {
                hitLength = Math.ceil(hitLength / 1.5);
                totalLength = Math.ceil(totalLength / 1.5);
            }
            if (mod.includes("NC")) {
                hitLength = Math.ceil(hitLength / 1.39);
                totalLength = Math.ceil(totalLength / 1.39);
            }
            if (mod.includes("HT")) {
                hitLength = Math.ceil(hitLength / 0.75);
                totalLength = Math.ceil(totalLength / 0.75);
            }
        }

        return `${this.timeString(this.hitLength)}${this.hitLength === hitLength ? "" : ` (${this.timeString(hitLength)})`}/${this.timeString(this.totalLength)}${this.totalLength === totalLength ? "" : ` (${this.timeString(totalLength)})`}`;
    }

    /**
     * Time string parsing function for statistics utility.
     */
    private timeString(second: number): string {
        return [Math.floor(second / 60), Math.ceil(second - Math.floor(second / 60) * 60).toString().padStart(2, "0")].join(":");
    }

    /**
     * Shows the beatmap's statistics based on applied mods and option.
     * 
     * - Option `0`: return map title and mods used if defined
     * - Option `1`: return map download link to official web, bloodcat, and sayobot
     * - Option `2`: return CS, AR, OD, HP
     * - Option `3`: return BPM, map length, max combo
     * - Option `4`: return last update date and map status
     * - Option `5`: return favorite count and play count
     */
    showStatistics(mod: string, option: number): string {
        const mapStatistics: MapStats = new MapStats(this).calculate({mods: mod, mode: modes.osu});
        mapStatistics.cs = parseFloat((mapStatistics.cs as number).toFixed(2));
        mapStatistics.ar = parseFloat((mapStatistics.ar as number).toFixed(2));
        mapStatistics.od = parseFloat((mapStatistics.od as number).toFixed(2));
        mapStatistics.hp = parseFloat((mapStatistics.hp as number).toFixed(2));

        switch (option) {
            case 0: return `${this.fullTitle}${mod ? ` +${mod}` : ""}`;
            case 1: {
                let string = `**Download**: [Bloodcat](https://bloodcat.com/osu/_data/beatmaps/${this.beatmapsetID}.osz) - [sayobot](https://osu.sayobot.cn/osu.php?s=${this.beatmapsetID})`;
                if (this.packs.length > 0) {
                    string += '\n**Beatmap Pack**: ';
                    for (let i = 0; i < this.packs.length; i++) {
                        string += `[${this.packs[i]}](https://osu.ppy.sh/beatmaps/packs/${this.packs[i]})`;
                        if (i + 1 < this.packs.length) string += ' - ';
                    }
                }
                return string;
            }
            case 2: return `**Circles**: ${this.circles} - **Sliders**: ${this.sliders} - **Spinners**: ${this.spinners}\n**CS**: ${this.cs}${this.cs === mapStatistics.cs ? "": ` (${mapStatistics.cs})`} - **AR**: ${this.ar}${this.ar === mapStatistics.ar ? "": ` (${mapStatistics.ar})`} - **OD**: ${this.od}${this.od === mapStatistics.od ? "": ` (${mapStatistics.od})`} - **HP**: ${this.hp}${this.hp === mapStatistics.hp ? "": ` (${mapStatistics.hp})`}`;
            case 3: return `**BPM**: ${this.convertBPM(mod)} - **Length**: ${this.convertTime(mod)} - **Max Combo**: ${this.maxCombo}x`;
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
    statusColor(): number {
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
     * Calculates the droid maximum score of the beatmap.
     * 
     * This requires the `file` property set to `true` when retrieving beatmap general information using `MapInfo.get()`.
     */
    maxScore(mod: string = ""): number {
        if (!this.map) {
            return 0;
        }
        const modbits: number = mods.modbitsFromString(mod);
        const difficultyMultiplier: number = 1 + this.od / 10 + this.hp / 10 + (this.cs - 3) / 4;

        // score multiplier
        let scoreMultiplier: number = 1;
        if (modbits & mods.osuMods.hr) {
            scoreMultiplier *= 1.06;
        }
        if (modbits & mods.osuMods.hd) {
            scoreMultiplier *= 1.06;
        }
        if (modbits & mods.osuMods.dt) {
            scoreMultiplier *= 1.12;
        }
        if (modbits & mods.osuMods.nc) {
            scoreMultiplier *= 1.12;
        }
        if (modbits & mods.osuMods.fl) {
            scoreMultiplier *= 1.12;
        }
        if (modbits & mods.osuMods.nf) {
            scoreMultiplier *= 0.5;
        }
        if (modbits & mods.osuMods.ez) {
            scoreMultiplier *= 0.5;
        }
        if (modbits & mods.osuMods.ht) {
            scoreMultiplier *= 0.3;
        }
        if (modbits & mods.osuMods.unranked) {
            scoreMultiplier = 0;
        }

        const map: Beatmap = this.map;
        const objects: HitObject[] = map.objects;
        const timingPoints: TimingPoint[] = map.timingPoints;
        let combo: number = 0;
        let score: number = 0;

        let tindex: number = -1;
        let tnext: number = Number.NEGATIVE_INFINITY;
        let pixelsPerBeat: number = 0;
        for (let i: number = 0; i < objects.length; ++i) {
            const object: HitObject = objects[i];
            if (!(object instanceof Slider)) {
                score += Math.floor(300 + 300 * combo * difficultyMultiplier * scoreMultiplier / 25);
                ++combo;
                continue;
            }

            while (object.time >= tnext) {
                ++tindex;
                if (timingPoints.length > tindex + 1) {
                    tnext = timingPoints[tindex + 1].time;
                } else {
                    tnext = Number.POSITIVE_INFINITY;
                }
                const t: TimingPoint = timingPoints[tindex];
                let sliderVelocityMultiplier: number = 1;
                if (!t.change && t.msPerBeat < 0) {
                    sliderVelocityMultiplier = -100 / t.msPerBeat;
                }

                pixelsPerBeat = map.sv * 100;
                if (map.formatVersion >= 8) {
                    pixelsPerBeat *= sliderVelocityMultiplier;
                }
            }

            const numberOfBeats: number = object.distance * object.repetitions / pixelsPerBeat;

            // subtract an epsilon to prevent accidental
            // ceiling of whole values such as 2.00....1 -> 3 due
            // to rounding errors
            let ticks = Math.ceil(
                (numberOfBeats - 0.1) / object.repetitions
                * map.tickRate
            );

            --ticks;
            const tickCount: number = Math.max(0, ticks * object.repetitions);

            score += 30 * object.repetitions + 10 * tickCount;

            combo += tickCount + object.repetitions;
            score += Math.floor(300 + 300 * combo * difficultyMultiplier * scoreMultiplier / 25);
            ++combo;
        }
        return score;
    }

    /**
     * Returns a string representative of the class.
     */
    toString(): string {
        return `${this.fullTitle}\nCS: ${this.cs} - AR: ${this.ar} - OD: ${this.od} - HP: ${this.hp}\nBPM: ${this.bpm} - Length: ${this.hitLength}/${this.totalLength} - Max Combo: ${this.maxCombo}\nLast Update: ${this.lastUpdate}`;
    }
}