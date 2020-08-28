const https = require('https');
const request = require('request');
const apikey = process.env.OSU_API_KEY;
const mods = require('./mods');
const modes = require('./constants/modes');
const objectTypes = require('./constants/objectTypes');
const Beatmap = require('./Beatmap');
const MapStats = require('./MapStats');
const Parser = require('./Parser');

/**
 * Represents a beatmap with general information.
 */
class MapInfo {
    constructor() {
        /**
         * @type {string}
         * @description The title of the song of the beatmap.
         */
        this.title = '';

        /**
         * @type {string}
         * @description The full title of the beatmap, which is `Artist - Title (Creator) [Difficulty Name]`.
         */
        this.full_title = '';

        /**
         * @type {string}
         * @description The artist of the song of the beatmap.
         */
        this.artist = '';

        /**
         * @type {string}
         * @description The creator of the beatmap.
         */
        this.creator = '';

        /**
         * @type {string}
         * @description The difficulty name of the beatmap. 
         */
        this.version = '';

        /**
         * @type {number}
         * @description The ranking status of the beatmap.
         * - `-2`: Graveyard
         * - `-1`: WIP
         * - `0`: Pending
         * - `1`: Ranked
         * - `2`: Approved
         * - `3`: Qualified
         * - `4`: Loved
         */
        this.approved = 0;

        /**
         * @type {number}
         * @description The beatmap's game mode. 0 is osu!standard, 1 is Taiko, 2 is Catch the Beat, 3 is osu!mania.
         */
        this.mode = 0;
        
        /**
         * @type {number}
         * @description The ID of the beatmap.
         */
        this.beatmap_id = 0;

        /**
         * @type {number}
         * @description The ID of the beatmapset containing the beatmap.
         */
        this.beatmapset_id = 0;

        /**
         * @type {number}
         * @description The amount of times the beatmap has been played.
         */
        this.plays = 0;

        /**
         * @type {number}
         * @description The amount of times the beatmap has been favorited.
         */
        this.favorites = 0;

        /**
         * @type {Date}
         * @description The date of which the beatmap was submitted.
         */
        this.submit_date = new Date(0);

        /**
         * @type {Date}
         * @description The date of which the beatmap was last updated.
         */
        this.last_update = new Date(0);

        /**
         * @type {number}
         * @description The duration of the beatmap not including breaks.
         */
        this.hit_length = 0;

        /**
         * @type {number}
         * @description The duration of the beatmap including breaks.
         */
        this.total_length = 0;

        /**
         * @type {number}
         * @description The BPM of the beatmap.
         */
        this.bpm = 0;

        /**
         * @type {number}
         * @description The amount of circles in the beatmap.
         */
        this.circles = 0;

        /**
         * @type {number}
         * @description The amount of sliders in the beatmap.
         */
        this.sliders = 0;

        /**
         * @type {number}
         * @description The amount of spinners in the beatmap.
         */
        this.spinners = 0;

        /**
         * @type {number}
         * @description The amount of objects in the beatmap.
         */
        this.objects = 0;

        /**
         * @type {number}
         * @description The maximum combo of the beatmap.
         */
        this.max_combo = 0;

         /**
          * @type {number}
          * @description The circle size of the beatmap.
          */
        this.cs = 0;

        /**
         * @type {number}
         * @description The approach rate of the beatmap.
         */
        this.ar = 0;

        /**
         * @type {number}
         * @description The overall difficulty of the beatmap.
         */
        this.od = 0;

        /**
         * @type {number}
         * @description The health drain rate of the beatmap.
         */
        this.hp = 0;

        /**
         * @type {string[]}
         * @description The beatmap packs that contain this beatmap, represented by their ID.
         */
        this.packs = [];
        
        /**
         * @type {number}
         * @description The aim difficulty rating of the beatmap.
         */
        this.diff_aim = 0;

        /**
         * @type {number}
         * @description The speed difficulty rating of the beatmap.
         */
        this.diff_speed = 0;

        /**
         * @type {number}
         * @description The generic difficulty rating of the beatmap.
         */
        this.diff_total = 0;

        /**
         * @type {string}
         * @description The MD5 hash of the beatmap.
         */
        this.hash = '';

        /**
         * @type {string}
         * @description The `.osu` file of the beatmap (required for some functions).
         */
        this.osu_file = '';

        /**
         * @type {Beatmap|null}
         * @description The parsed beatmap from beatmap parser.
         */
        this.map = null;

        /**
         * @type {boolean}
         * @description Whether or not the fetch result from `get()` returns an error. This should be immediately checked after calling said method.
         */
        this.error = false;
    }

    /**
     * Retrieve a beatmap's general information.
     * 
     * Either beatmap ID or MD5 hash of the beatmap must be specified.
     *
     * @param {Object} params An object containing parameters.
     * @param {number} [params.beatmap_id] The beatmap ID of the beatmap.
     * @param {string} [params.hash] The MD5 hash of the beatmap.
     * @param {boolean} [params.file=true] Whether or not to download the .osu file of the beatmap (required for beatmap parser utilities)
     * @returns {Promise<MapInfo>} The current class instance with the beatmap's information.
     */
    get(params = {}) {
        return new Promise(resolve => {
            let beatmapid = params.beatmap_id;
            let hash = params.hash;
            if (params.file === undefined) {
                params.file = true;
            }

            let options;
            if (beatmapid) {
                options = new URL(`https://osu.ppy.sh/api/get_beatmaps?k=${apikey}&b=${beatmapid}`);
            }
            else if (hash) {
                options = new URL(`https://osu.ppy.sh/api/get_beatmaps?k=${apikey}&h=${hash}`);
            }
            else {
                throw new TypeError("Beatmap ID or MD5 hash must be defined");
            }

            let content = '';
            let req = https.get(options, res => {
                res.setEncoding("utf8");
                res.on("data", chunk => {
                    content += chunk;
                });
                res.on("error", err => {
                    console.log("Error retrieving map info\n" + err);
                    this.error = true;
                    return resolve(this);
                });
                res.on("end", () => {
                    let obj;
                    try {
                        obj = JSON.parse(content);
                    } catch (e) {
                        console.log("Error parsing map info");
                        this.error = true;
                        return resolve(this);
                    }
                    if (!obj || !obj[0]) {
                        console.log("Map not found");
                        return resolve(this);
                    }
                    let mapinfo = obj[0];
                    if (parseInt(mapinfo.mode) !== 0) {
                        console.log("Mode not supported");
                        return resolve(this);
                    }

                    this.full_title = `${mapinfo.artist} - ${mapinfo.title} (${mapinfo.creator}) [${mapinfo.version}]`;
                    this.title = mapinfo.title;
                    this.artist = mapinfo.artist;
                    this.creator = mapinfo.creator;
                    this.version = mapinfo.version;
                    this.approved = parseInt(mapinfo.approved);
                    this.mode = parseInt(mapinfo.mode);
                    this.beatmap_id = parseInt(mapinfo.beatmap_id);
                    this.beatmapset_id = parseInt(mapinfo.beatmapset_id);
                    this.plays = parseInt(mapinfo.playcount);
                    this.favorites = parseInt(mapinfo.favourite_count);
                    let t = mapinfo.last_update.split(/[- :]/);
                    this.last_update = new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]));
                    let s = mapinfo.submit_date.split(/[- :]/);
                    this.submit_date = new Date(Date.UTC(s[0], s[1]-1, s[2], s[3], s[4], s[5]));
                    this.hit_length = parseInt(mapinfo.hit_length);
                    this.total_length = parseInt(mapinfo.total_length);
                    this.bpm = parseFloat(mapinfo.bpm);
                    this.circles = mapinfo.count_normal ? parseInt(mapinfo.count_normal) : 0;
                    this.sliders = mapinfo.count_slider ? parseInt(mapinfo.count_slider) : 0;
                    this.spinners = mapinfo.count_slider ? parseInt(mapinfo.count_spinner) : 0;
                    this.objects = this.circles + this.sliders + this.spinners;
                    this.max_combo = parseInt(mapinfo.max_combo);
                    this.cs = parseFloat(mapinfo.diff_size);
                    this.ar = parseFloat(mapinfo.diff_approach);
                    this.od = parseFloat(mapinfo.diff_overall);
                    this.hp = parseFloat(mapinfo.diff_drain);
                    if (mapinfo.packs) {
                        this.packs = mapinfo.packs.split(",");
                    }
                    this.diff_aim = mapinfo.diff_aim ? parseFloat(mapinfo.diff_aim) : 0;
                    this.diff_speed = mapinfo.diff_speed ? parseFloat(mapinfo.diff_speed) : 0;
                    this.diff_total = mapinfo.difficultyrating ? parseFloat(mapinfo.difficultyrating) : 0;
                    this.hash = mapinfo.file_md5;
                    if (!params.file) {
                        return resolve(this);
                    }
                    let url = `https://osu.ppy.sh/osu/${this.beatmap_id}`;
                    request(url, (err, response, data) => {
                        if (err || !data) {
                            console.log("Error downloading osu file");
                            this.error = true;
                            return resolve(this);
                        }
                        let parser = new Parser();
                        parser.parse(data);

                        this.osu_file = data;
                        this.map = parser.map;
                        resolve(this);
                    });
                });
            });
            req.end();
        });
    }

    /**
     * Converts the beatmap's BPM if speed-changing mods are applied.
     *
     * @param {string} [mod] The mod string applied.
     * @returns {string} The BPM in `original BPM (speed-changed BPM)` string format if speed-changing mods exist.
     * @private
     */
    _bpmConvert(mod = '') {
        let bpm = this.bpm;
        if (mod) {
            if (mod.includes("DT")) bpm *= 1.5;
            if (mod.includes("NC")) bpm *= 1.39;
            if (mod.includes("HT")) bpm *= 0.75;
            if (mod.includes("SU")) bpm *= 1.25;
        }
        return `${this.bpm}${this.bpm === bpm ? "" : ` (${bpm.toFixed(2)})`}`;
    }

    /**
     * Converts the beatmap's status into human-readable data.
     *
     * @returns {string} The current status of the beatmap.
     * @private
     */
    _statusConvert() {
        switch (this.approved) {
            case -2: return "Graveyard";
            case -1: return "WIP";
            case 0: return "Pending";
            case 1: return "Ranked";
            case 2: return "Approved";
            case 3: return "Qualified";
            case 4: return "Loved";
            default: return "Unspecified";
        }
    }

    /**
     * Converts the beatmap's length if speed-changing mods are applied.
     *
     * @param {string} [mod] The mod string applied.
     * @returns {string} The beatmap length in `hit length (speed-changed hit length)/total length (speed-changed total length)` format if speed-changing mods exist.
     * @private
     */
    _timeConvert(mod = '') {
        let hitlength = this.hit_length;
        let maplength = this.total_length;
        if (mod) {
            if (mod.includes("DT")) {
                hitlength = Math.ceil(hitlength / 1.5);
                maplength = Math.ceil(maplength / 1.5);
            }
            if (mod.includes("NC")) {
                hitlength = Math.ceil(hitlength / 1.39);
                maplength = Math.ceil(maplength / 1.39);
            }
            if (mod.includes("HT")) {
                hitlength = Math.ceil(hitlength * 4/3);
                maplength = Math.ceil(maplength * 4/3);
            }
            if (mod.includes("SU")) {
                hitlength = Math.ceil(hitlength / 1.25);
                maplength = Math.ceil(maplength / 1.25);
            }
        }
        return `${timeString(this.hit_length)}${this.hit_length === hitlength ? "" : ` (${timeString(hitlength)})`}/${timeString(this.total_length)}${this.total_length === maplength ? "" : ` (${timeString(maplength)})`}`;
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
     *
     * @param {string} mods The mod string applied.
     * @param {number} option The option to apply as described.
     * @returns {string} The statistics based on applied option.
     */
    showStatistics(mods, option) {
        let mapstat = new MapStats(this).calculate({mods: mods, mode: modes.osu});
        mapstat.cs = parseFloat(mapstat.cs.toFixed(2));
        mapstat.ar = parseFloat(mapstat.ar.toFixed(2));
        mapstat.od = parseFloat(mapstat.od.toFixed(2));
        mapstat.hp = parseFloat(mapstat.hp.toFixed(2));

        switch (option) {
            case 0: return `${this.full_title}${mods ? ` +${mods}` : ""}`;
            case 1: {
                let string = `**Download**: [Bloodcat](https://bloodcat.com/osu/_data/beatmaps/${this.beatmapset_id}.osz) - [sayobot](https://osu.sayobot.cn/osu.php?s=${this.beatmapset_id})`;
                if (this.packs.length > 0) {
                    string += '\n**Beatmap Pack**: ';
                    for (let i = 0; i < this.packs.length; i++) {
                        string += `[${this.packs[i]}](https://osu.ppy.sh/beatmaps/packs/${this.packs[i]})`;
                        if (i + 1 < this.packs.length) string += ' - ';
                    }
                }
                return string;
            }
            case 2: return `**Circles**: ${this.circles} - **Sliders**: ${this.sliders} - **Spinners**: ${this.spinners}\n**CS**: ${this.cs}${this.cs == mapstat.cs ? "": ` (${mapstat.cs})`} - **AR**: ${this.ar}${this.ar == mapstat.ar ? "": ` (${mapstat.ar})`} - **OD**: ${this.od}${this.od == mapstat.od ? "": ` (${mapstat.od})`} - **HP**: ${this.hp}${this.hp == mapstat.hp ? "": ` (${mapstat.hp})`}`;
            case 3: return `**BPM**: ${this._bpmConvert(mods)} - **Length**: ${this._timeConvert(mods)} - **Max Combo**: ${this.max_combo}x`;
            case 4: return `**Last Update**: ${this.last_update.toUTCString()} | **${this._statusConvert()}**`;
            case 5: return `❤️ **${this.favorites.toLocaleString()}** - ▶️ **${this.plays.toLocaleString()}**`;
            default: throw {
                name: "NotSupportedError",
                message: `This mode (${option}) is not supported`
            };
        }
    }

    /**
     * Returns a color integer based on the beatmap's ranking status.
     * 
     * Useful to make embed messages.
     *
     * @returns {number} An integer representing a color.
     */
    statusColor() {
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
     *
     * @param {string} [mod] The mod string applied. This will amplify the score multiplier.
     * @returns {number} The maximum score of the beatmap. If `file` property was set to `false`, returns `0`.
     */
    max_score(mod = '') {
        if (!this.map) {
            return 0;
        }
        const modbits = mods.modbits_from_string(mod);
        let diff_multiplier = 1 + this.od / 10 + this.hp / 10 + (this.cs - 3) / 4;

        // score multiplier
        let score_multiplier = 1;
        if (modbits & mods.hd) score_multiplier *= 1.06;
        if (modbits & mods.hr) score_multiplier *= 1.06;
        if (modbits & mods.dt) score_multiplier *= 1.12;
        if (modbits & mods.nc) score_multiplier *= 1.12;
        if (modbits & mods.fl) score_multiplier *= 1.12;
        if (modbits & mods.nf) score_multiplier *= 0.5;
        if (modbits & mods.ez) score_multiplier *= 0.5;
        if (modbits & mods.ht) score_multiplier *= 0.3;
        if (mod.includes("SU")) score_multiplier *= 1.06;
        if (mod.includes("RE")) score_multiplier *= 0.4;

        if (modbits & mods.unranked) score_multiplier = 0;

        let map = this.map;
        let objects = map.objects;
        let combo = 0;
        let score = 0;

        let tindex = -1;
        let tnext = Number.NEGATIVE_INFINITY;
        let px_per_beat = 0;
        for (let i = 0; i < objects.length; i++) {
            let object = objects[i];
            if (!(object.type & objectTypes.slider)) {
                score += Math.floor(300 + 300 * combo * diff_multiplier * score_multiplier / 25);
                ++combo;
                continue;
            }
            while (object.time >= tnext) {
                ++tindex;
                if (map.timing_points.length > tindex + 1) {
                    tnext = map.timing_points[tindex + 1].time;
                } else {
                    tnext = Number.POSITIVE_INFINITY;
                }

                let t = map.timing_points[tindex];
                let sv_multiplier = 1.0;
                if (!t.change && t.ms_per_beat < 0) {
                    sv_multiplier = -100 / t.ms_per_beat;
                }

                if (map.format_version < 8) {
                    px_per_beat = map.sv * 100;
                } else {
                    px_per_beat = map.sv * 100 * sv_multiplier;
                }
            }
            let data = object.data;
            let num_beats = data.distance * data.repetitions / px_per_beat;
            let ticks = Math.ceil((num_beats - 0.1) / data.repetitions * map.tick_rate);

            --ticks;
            let tick_count = Math.max(0, ticks * data.repetitions);

            score += 30 * data.repetitions + 10 * tick_count;

            combo += tick_count + data.repetitions;
            score += Math.floor(300 + 300 * combo * diff_multiplier * score_multiplier / 25);
            ++combo;
        }
        return score;
    }

    toString() {
        return `${this.full_title}\nCS: ${this.cs} - AR: ${this.ar} - OD: ${this.od} - HP: ${this.hp}\nBPM: ${this.bpm} - Length: ${this.hit_length}/${this.total_length} - Max Combo: ${this.max_combo}\nLast Update: ${this.last_update}`;
    }
}

/**
 * (Internal)
 * 
 * Time string parsing function for statistics utility.
 *
 * @param {number} [second] The amount of seconds to parse.
 * @returns {string} The parsed time string in `HH:MM:SS` format.
 */
function timeString(second) {
    return [Math.floor(second / 60), Math.ceil(second - Math.floor(second / 60) * 60).toString().padStart(2, "0")].join(":");
}

module.exports = MapInfo;