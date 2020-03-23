// this is a library that I wrote in order to clean some code
// in commands, do note that even though this library is open
// to public, you need an osu!droid API key to access player info

// required dependencies
const http = require('http');
const https = require('https');
require('dotenv').config();
const droidapikey = process.env.DROID_API_KEY;
const apikey = process.env.OSU_API_KEY;
const request = require('request');

let osudroid = {};
if (typeof exports !== 'undefined') {
    osudroid = exports
}

(function() {

let log = {warn: Function.prototype};

if (typeof exports !== "undefined") {
    log = console
}

// PlayerInfo instance
// ------------------------------
// represents an osu!droid player
class PlayerInfo {
    constructor() {
        this.uid = 0;
        this.name = '';
        this.avatarURL = '';
        this.location = '';
        this.email = '';
        this.rank = 0;
        this.score = 0;
        this.accuracy = 0;
        this.play_count = 0;
        this.recent_plays = [];
    }

    // retrieve a player's info based on uid or username
    // -------------------------------------------------
    // params:
    //  uid or username
    //
    // returns a callback of the player's statistics
    get(params, callback) {
        let uid = parseInt(params.uid);
        let username = params.username;
        if (isNaN(uid) && !username) throw new TypeError("Uid must be integer or enter username");
        let options = {
            host: "ops.dgsrz.com",
            port: 80,
            path: `/api/getuserinfo.php?apiKey=${droidapikey}&${uid ? `uid=${uid}` : `username=${username}`}`
        };
        let content = '';
        let req = http.request(options, res => {
            res.setTimeout(10000);
            res.setEncoding("utf8");
            res.on("data", chunk => {
                content += chunk
            });
            res.on("error", err => {
                console.log("Error retrieving player info");
                console.log(err);
                return callback(this)
            });
            res.on("end", () => {
                let resarr = content.split("<br>");
                let headerres = resarr[0].split(" ");
                if (headerres[0] == 'FAILED') {
                    return callback(this)
                }
                let obj;
                try {
                    obj = JSON.parse(resarr[1])
                } catch (e) {
                    console.log("Error parsing player info");
                    return callback(this)
                }
                uid = headerres[1];
                let name = headerres[2];
                let total_score = parseInt(headerres[3]);
                let play_count = parseInt(headerres[4]);
                let email = headerres[6];
                let rank = obj.rank;
                let acc = parseFloat((parseFloat(headerres[5]) * 100).toFixed(2));
                let recent_plays = obj.recent ? obj.recent : [];
                this.uid = uid;
                this.name = name;
                this.score = total_score;
                this.email = email;
                this.play_count = play_count;
                this.accuracy = acc;
                this.rank = rank;
                this.recent_plays = recent_plays;

                let avatar_page = `http://ops.dgsrz.com/profile.php?uid=${uid}`;
                request(avatar_page, (err, response, data) => {
                    if (err) {
                        console.log(err);
                        return callback(this)
                    }
                    let b = data.split("\n");
                    let avalink = '';
                    let location = '';
                    for (let x = 0; x < b.length; x++) {
                        if (b[x].includes('h3 m-t-xs m-b-xs')) {
                            b[x-3]=b[x-3].replace('<img src="',"");
                            b[x-3]=b[x-3].replace('" class="img-circle">',"");
                            b[x-3]=b[x-3].trim();
                            avalink = b[x-3];
                            b[x+1]=b[x+1].replace('<small class="text-muted"><i class="fa fa-map-marker"><\/i>',"");
                            b[x+1]=b[x+1].replace("<\/small>","");
                            b[x+1]=b[x+1].trim();
                            location=b[x+1];
                            break
                        }
                    }
                    this.avatarURL = avalink;
                    this.location = location;
                    callback(this)
                })
            })
        });
        req.end()
    }

    toString() {
        return `Username: ${this.name}\nUID: ${this.uid}\nRank: ${this.rank}\nScore: ${this.score}\nPlay count: ${this.play_count}`
    }
}

// bitmask constant of objects
let object_types = {
    circle: 1<<0,
    slider: 1<<1,
    spinner: 1<<3,
};

// MapInfo instance
// ---------------------------------------------
// represents a beatmap with general information
class MapInfo {
    constructor() {
        this.title = '';
        this.full_title = '';
        this.artist = '';
        this.creator = '';
        this.version = '';
        this.approved = 0;
        this.mode = 0;
        this.beatmap_id = 0;
        this.beatmapset_id = 0;
        this.plays = 0;
        this.favorites = 0;
        this.last_update = 0;
        this.hit_length = 0;
        this.total_length = 0;
        this.bpm = 0;
        this.circles = 0;
        this.sliders = 0;
        this.spinners = 0;
        this.objects = 0;
        this.max_combo = 0;
        this.cs = 0;
        this.ar = 0;
        this.od = 0;
        this.hp = 0;
        this.packs = '';
        this.diff_aim = 0;
        this.diff_speed = 0;
        this.diff_total = 0;
        this.hash = '';
        this.osu_file = ''
    }

    // retrieve a beatmap's information
    // -------------------------------------------
    // params:
    //  beatmap_id or hash (one is required), file = true
    //
    // returns a callback of the map's information
    get(params, callback) {
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
            res.setTimeout(10000);
            res.setEncoding("utf8");
            res.on("data", chunk => {
                content += chunk
            });
            res.on("error", err => {
                console.log("Error retrieving map info");
                console.log(err);
                return callback(this)
            });
            res.on("end", () => {
                let obj;
                try {
                    obj = JSON.parse(content)
                } catch (e) {
                    console.log("Error parsing map info");
                    return callback(this)
                }
                if (!obj || !obj[0]) {
                    console.log("Map not found");
                    return callback(this)
                }
                let mapinfo = obj[0];
                if (mapinfo.mode != 0) {
                    return callback(this)
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
                this.last_update = mapinfo.last_update;
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
                if (mapinfo.packs) this.packs = mapinfo.packs;
                this.diff_aim = mapinfo.diff_aim ? parseFloat(mapinfo.diff_aim) : 0;
                this.diff_speed = mapinfo.diff_speed ? parseFloat(mapinfo.diff_speed) : 0;
                this.diff_total = mapinfo.difficultyrating ? parseFloat(mapinfo.difficultyrating) : 0;
                this.hash = mapinfo.file_md5;
                if (!params.file) {
                    return callback(this)
                }
                let url = `https://osu.ppy.sh/osu/${this.beatmap_id}`;
                request(url, (err, response, data) => {
                    if (err) {
                        console.log("Error downloading osu file");
                        return callback(this)
                    }
                    this.osu_file = data;
                    callback(this)
                })
            })
        });
        req.end()
    }

    // (internal)
    // convert a map's bpm if speed-changing mod is applied
    _bpmConvert(mod) {
        let bpm = this.bpm;
        if (mod && mod != '-') {
            if (mod.includes("d") || mod.includes("DT")) bpm *= 1.5;
            if (mod.includes("c") || mod.includes("NC")) bpm *= 1.39;
            if (mod.includes("t") || mod.includes("HT")) bpm *= 0.75
        }
        return `${this.bpm}${this.bpm == bpm ? "" : ` (${bpm.toFixed(2)})`}`
    }

    // (internal)
    // convert map status into human-readable data
    _statusConvert() {
        switch (this.approved) {
            case -2: return "Graveyard";
            case -1: return "WIP";
            case 0: return "Pending";
            case 1: return "Ranked";
            case 2: return "Approved";
            case 3: return "Qualified";
            case 4: return "Loved";
            default: return "Unspecified"
        }
    }

    // (internal)
    // convert map length if speed-changing mod is applied
    _timeConvert(mod) {
        let hitlength = this.hit_length;
        let maplength = this.total_length;
        if (mod && mod != '-') {
            if (mod.includes("d") || mod.includes("DT")) {
                hitlength = Math.ceil(hitlength / 1.5);
                maplength = Math.ceil(maplength / 1.5)
            }
            if (mod.includes("c") || mod.includes("NC")) {
                hitlength = Math.ceil(hitlength / 1.39);
                maplength = Math.ceil(maplength / 1.39)
            }
            if (mod.includes("t") || mod.includes("HT")) {
                hitlength = Math.ceil(hitlength * 4/3);
                maplength = Math.ceil(maplength * 4/3)
            }
        }
        return `${timeString(this.hit_length)}${this.hit_length == hitlength ? "" : ` (${timeString(hitlength)})`}/${timeString(this.total_length)}${this.total_length == maplength ? "" : ` (${timeString(maplength)})`}`
    }

    // show the map's statistics
    // -----------------------------------------------------------------------
    // option 0: return map title and mods used if defined
    // option 1: return map download link to official web, bloodcat, and sayobot
    // option 2: return CS, AR, OD, HP
    // option 3: return BPM, map length, max combo
    // option 4: return last update date and map status
    // option 5: return favorite count and play count
    //
    // mods is optional
    showStatistics(mods = "", option) {
        this.mods = mods;
        let mapstat = new MapStats(this).calculate({mods: mods, mode: 'osu'});
        mapstat.cs = parseFloat(mapstat.cs.toFixed(2));
        mapstat.ar = parseFloat(mapstat.ar.toFixed(2));
        mapstat.od = parseFloat(mapstat.od.toFixed(2));
        mapstat.hp = parseFloat(mapstat.hp.toFixed(2));

        switch (option) {
            case 0: return `${this.full_title}${mods ? ` +${mods}` : ""}`;
            case 1: return `**Download**: [osu!](https://osu.ppy.sh/beatmapsets/${this.beatmapset_id}/download) ([no video](https://osu.ppy.sh/beatmapsets/${this.beatmapset_id}/download?noVideo=1))${this.packs ? ` - [Beatmap Pack ${this.packs}](https://osu.ppy.sh/beatmaps/packs/${this.packs})` : ""} - [Bloodcat](https://bloodcat.com/osu/_data/beatmaps/${this.beatmapset_id}.osz) - [sayobot](https://osu.sayobot.cn/osu.php?s=${this.beatmapset_id})`;
            case 2: return `**CS**: ${this.cs}${this.cs == mapstat.cs ? "": ` (${mapstat.cs})`} - **AR**: ${this.ar}${this.ar == mapstat.ar ? "": ` (${mapstat.ar})`} - **OD**: ${this.od}${this.od == mapstat.od ? "": ` (${mapstat.od})`} - **HP**: ${this.hp}${this.hp == mapstat.hp ? "": ` (${mapstat.hp})`}`;
            case 3: return `**BPM**: ${this._bpmConvert(this.mods)} - **Length**: ${this._timeConvert(this.mods)} - **Max Combo**: ${this.max_combo}x`;
            case 4: return `**Last Update**: ${this.last_update} | **${this._statusConvert()}**`;
            case 5: return `❤️ **${this.favorites.toLocaleString()}** - ▶️ **${this.plays.toLocaleString()}**`;
            default: throw {
                name: "NotSupportedError",
                message: `This mode (${option}) is not supported`
            }
        }
    }

    // return a color integer based on ranked status
    // ---------------------------------------------
    // useful to make embed messages
    statusColor() {
        switch (this.approved) {
            case -2: return 16711711; // Graveyard: red
            case -1: return 9442302; // WIP: purple
            case 0: return 16312092; // Pending: yellow
            case 1: return 2483712; // Ranked: green
            case 2: return 16741376; // Approved: tosca
            case 3: return 5301186; // Qualified: light blue
            case 4: return 16711796; // Loved: pink
            default: return 0
        }
    }

    // calculate droid max score of the beatmap
    // -----------------------------------------
    // code to count amount of ticks are
    // mainly copied from ojsama
    //
    // osu file is required to parse the beatmap
    // or else this would not work
    //
    // you can specify enabled mods in string
    // to amplify score multiplier
    max_score(mod = '') {
        if (!this.osu_file) {
            return 0;
        }
        let stats = new MapStats(this).calculate({mode: "osu", mods: mod});
        mod = mods.modbits_from_string(mod);
        let diff_multiplier = 1 + stats.od / 10 + stats.hp / 10 + (stats.cs - 3) / 4;

        // score multiplier
        let score_multiplier = 1;
        if (mod & mods.hd) score_multiplier *= 1.06;
        if (mod & mods.hr) score_multiplier *= 1.06;
        if (mod & mods.dt) score_multiplier *= 1.12;
        if (mod & mods.nc) score_multiplier *= 1.12;
        if (mod & mods.nf) score_multiplier *= 0.5;
        if (mod & mods.ez) score_multiplier *= 0.5;
        if (mod & mods.ht) score_multiplier *= 0.3;

        let parser = new Parser();
        try {
            parser.parse(this.osu_file)
        } catch (e) {
            console.log("Invalid osu file");
            return 0
        }
        let map = parser.map;
        let objects = map.objects;
        let combo = 0;
        let score = 0;
        for (let i = 0; i < objects.length; i++) {
            let object = objects[i];
            if (!(object.type & object_types.slider)) {
                score += Math.floor(300 + 300 * combo * diff_multiplier * score_multiplier / 25);
                ++combo;
                continue
            }
            let tindex = -1;
            let tnext = Number.NEGATIVE_INFINITY;
            let px_per_beat = 0;
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
            ++combo
        }
        return score
    }

    toString() {
        return `${this.full_title}\nCS: ${this.cs} - AR: ${this.ar} - OD: ${this.od} - HP: ${this.hp}\nBPM: ${this.bpm} - Length: ${this.hit_length}/${this.total_length} - Max Combo: ${this.max_combo}\nLast Update: ${this.last_update}`
    }
}

    function timeString(second) {
    return [Math.floor(second / 60), Math.ceil(second - Math.floor(second / 60) * 60).toString().padStart(2, "0")].join(":")
}

let mods = {
    // bitmask constant of mods both for osu!droid and osu!standard
    // ------------------------------------------------------------
    // osu!droid
    n: 1<<0, // NF
    e: 1<<1, // EZ
    h: 1<<3, // HD
    r: 1<<4, // HR
    d: 1<<6, // DT
    t: 1<<8, // HT
    c: 1<<9, // NC

    // osu!standard
    nomod: 0,
    nf: 1<<0,
    ez: 1<<1,
    td: 1<<2,
    hd: 1<<3,
    hr: 1<<4,
    dt: 1<<6,
    ht: 1<<8,
    nc: 1<<9,
    fl: 1<<10,
    so: 1<<12,
    v2: 1<<29,

    // functions
    // -----------------------------------
    // convert droid mod string to modbits
    droid_to_modbits(mod = "") {
        let modbits = 4;
        if (!mod || mod == '-') {
            return modbits;
        }
        mod = mod.toLowerCase();
        while (mod != '') {
            for (let property in this) {
                if (!this.hasOwnProperty(property)) continue;
                if (property.length != 1) continue;
                if (mod.startsWith(property)) {
                    modbits |= this[property];
                    break
                }
            }
            mod = mod.substr(1)
        }
        return modbits
    },

    // convert droid mod string to PC mod string
    // --------------------------------------------
    // you can choose to return a detailed response
    droid_to_PC(mod = "", detailed = false) {
        if (!mod) return '';
        mod = mod.toLowerCase();
        if (detailed) {
            let res = '';
            let count = 0;
            if (mod.includes("-")) {res += 'None '; count++}
            if (mod.includes("n")) {res += 'NoFail '; count++}
            if (mod.includes("e")) {res += 'Easy '; count++}
            if (mod.includes("t")) {res += 'HalfTime '; count++}
            if (mod.includes("h")) {res += 'Hidden '; count++}
            if (mod.includes("d")) {res += 'DoubleTime '; count++}
            if (mod.includes("r")) {res += 'HardRock '; count++}
            if (mod.includes("c")) {res += 'NightCore '; count++}
            if (count > 1) {
                return res.trimRight().split(" ").join(", ");
            } else {
                return res.trimRight()
            }
        }
        let modbits = 0;
        while (mod != '') {
            for (let property in this) {
                if (!this.hasOwnProperty(property)) continue;
                if (property.length != 1) continue;
                if (mod.startsWith(property)) {
                    modbits |= this[property];
                    break
                }
            }
            mod = mod.substr(1)
        }
        return this.modbits_to_string(modbits)
    },

    // construct the mods bitmask from a string such as "HDHR"
    // thanks Francesco
    modbits_from_string(str = "") {
        let mask = 0;
        str = str.toLowerCase();
        while (str != "") {
            let nchars = 1;
            for (let property in this) {
                if (!this.hasOwnProperty(property)) continue;
                if (property.length != 2) continue;
                if (str.startsWith(property)) {
                    mask |= this[property];
                    nchars = 2;
                    break
                }
            }
            str = str.slice(nchars)
        }
        return mask
    },

    // convert mods bitmask into a string, such as "HDHR"
    // again thanks Francesco
    modbits_to_string(mod = 0) {
        let res = "";
        for (let property in this) {
            if (property.length != 2) continue;
            if (!this.hasOwnProperty(property)) continue;
            if (mod & this[property]) res += property.toUpperCase()
        }
        if (res.indexOf("DT") >= 0 && res.indexOf("NC") >= 0) res = res.replace("DT", "");
        return res
    }
};

mods.speed_changing = mods.dt | mods.nc | mods.ht;
mods.map_changing = mods.ez | mods.hr | mods.speed_changing;

let rankImage = {
    S: "http://ops.dgsrz.com/assets/images/ranking-S-small.png",
    A: "http://ops.dgsrz.com/assets/images/ranking-A-small.png",
    B: "http://ops.dgsrz.com/assets/images/ranking-B-small.png",
    C: "http://ops.dgsrz.com/assets/images/ranking-C-small.png",
    D: "http://ops.dgsrz.com/assets/images/ranking-D-small.png",
    SH: "http://ops.dgsrz.com/assets/images/ranking-SH-small.png",
    X: "http://ops.dgsrz.com/assets/images/ranking-X-small.png",
    XH: "http://ops.dgsrz.com/assets/images/ranking-XH-small.png",

    // return image link of a specified rank
    // -------------------------------------
    // params:
    //  rank: rank to get (S, A, etc)
    get(rank = "") {
        rank = rank.toUpperCase();
        if (this.hasOwnProperty(rank)) {
            return this[rank]
        } else {
            return "Unknown"
        }
    }
};

// (internal)
// osu!standard stats constants
let OD0_MS = 80;
let OD10_MS = 20;
let AR0_MS = 1800.0;
let AR5_MS = 1200.0;
let AR10_MS = 450.0;

let OD_MS_STEP = (OD0_MS - OD10_MS) / 10.0;
let AR_MS_STEP1 = (AR0_MS - AR5_MS) / 5.0;
let AR_MS_STEP2 = (AR5_MS - AR10_MS) / 5.0;

// (internal)
// utility functions to apply speed and flat multipliers to
// stats where speed changes apply (ar and od)
function modify_ar(base_ar, speed_mul, multiplier) {
    let ar = base_ar;
    ar *= multiplier;
    let arms = (
        ar < 5.0 ?
            AR0_MS-AR_MS_STEP1 * ar
            : AR5_MS - AR_MS_STEP2 * (ar - 5)
    );
    arms = Math.min(AR0_MS, Math.max(AR10_MS, arms));
    arms /= speed_mul;

    ar = (
        arms > AR5_MS ?
            (AR0_MS - arms) / AR_MS_STEP1
            : 5 + (AR5_MS - arms) / AR_MS_STEP2
    );
    return ar
}

function modify_od(base_od, speed_mul, multiplier) {
    let od = base_od;
    od *= multiplier;
    let odms = OD0_MS - Math.ceil(OD_MS_STEP * od);
    odms = Math.min(OD0_MS, Math.max(OD10_MS, odms));
    odms /= speed_mul;
    od = (OD0_MS - odms) / OD_MS_STEP;
    return od
}

// MapStats instance
// ----------------------------------------------------------
// holds general beatmap statistics for further modifications
class MapStats {
    // values:
    //  cs: circle size
    //  ar: approach rate
    //  od: overall difficulty
    //  hp: health drain rate
    //  mods: enabled modifications in osu!standard string
    //
    // all value properties are optional and can be ignored
    constructor(values = {}) {
        this.cs = values.cs;
        this.ar = values.ar;
        this.od = values.od;
        this.hp = values.hp;

        this.mods = values.mods;
        if (this.mods === undefined) {
            this.mods = ''
        }

        this.mods = this.mods.toUpperCase();
        this.droid_mods = this.pc_mods = this.mods ? mods.modbits_from_string(this.mods) : 0;

        // apply TD mod to droid bitwise enum if it hasn't
        // been applied
        if (!(this.droid_mods & mods.td)) {
            this.droid_mods += mods.td;
        }
        this.speed_multiplier = 1;
    }

    // calculate map statistics with mods applied
    // ---------------------------------------------------
    // params:
    //  mode: droid or osu, switch between osu!droid stats
    //        and osu!standard stats
    //  mods: applied modifications in string, if this has
    //        been applied in the constructor you can
    //        ignore this
    calculate(params = {}) {
        if (params.mods) {
            this.mods = params.mods;
        }
        let mode = params.mode || "osu";
        let stats = new MapStats(this);
        let od_ar_hp_multiplier = 1;
        if ((stats.droid_mods & mods.d) | (stats.pc_mods & mods.dt)) {
            stats.speed_multiplier = 1.5;
        }
        if ((stats.droid_mods & mods.t) | (stats.pc_mods & mods.ht)) {
            stats.speed_multiplier *= 0.75;
        }
        if ((stats.droid_mods & mods.r) | (stats.pc_mods & mods.hr)) {
            od_ar_hp_multiplier = 1.4;
        }
        if ((stats.droid_mods & mods.e) | (stats.pc_mods & mods.ez)) {
            od_ar_hp_multiplier *= 0.5;
        }
        switch (mode) {
            case "osu!droid":
            case "droid": {
                // In droid pre-1.6.8, NC speed multiplier is assumed bugged (1.39)
                if (stats.droid_mods & mods.c) {
                    stats.speed_multiplier = 1.39;
                }

                // CS and OD work differently in droid, therefore it
                // needs to be computed regardless of map-changing mods
                // and od_ar_hp_multiplier
                if (stats.od !== undefined) {

                    // apply EZ or HR to OD
                    stats.od *= od_ar_hp_multiplier;
                    stats.od = Math.min(stats.od, 10);

                    // convert original OD to droid OD
                    let droid_to_MS = 75 + 5 * (5 - stats.od);
                    if (stats.mods.includes("PR")) {
                        droid_to_MS = 55 + 6 * (5 - stats.od)
                    }
                    stats.od = 5 - (droid_to_MS - 50) / 6;

                    // apply speed-changing mods to OD
                    // use 1 as multiplier as it has been multiplied previously
                    stats.od = modify_od(stats.od, stats.speed_multiplier, 1)
                }

                // HR and EZ works differently in droid in terms of
                // CS modification, instead of CS *= 1.3 or CS *= 0.5,
                // it is incremented or decremented
                //
                // if present mods are found, they need to be removed
                // from the bitwise enum of mods to prevent double
                // calculation
                if (stats.cs !== undefined) {
                    if (stats.droid_mods & mods.r) {
                        stats.droid_mods -= mods.r;
                        ++stats.cs;
                    }
                    if (stats.droid_mods & mods.e) {
                        stats.droid_mods -= mods.e;
                        --stats.cs;
                    }
                    stats.cs -= 4;
                    stats.cs = Math.min(10, stats.cs);
                }

                if (stats.hp !== undefined) {
                    stats.hp *= od_ar_hp_multiplier;
                    stats.hp = Math.min(10, stats.hp);
                }

                if (stats.ar !== undefined) {
                    stats.ar = modify_ar(stats.ar, stats.speed_multiplier, od_ar_hp_multiplier);
                }
                break
            }
            case "osu!":
            case "osu": {
                if (!(stats.pc_mods & mods.map_changing)) {
                    return stats;
                }
                if (stats.pc_mods & mods.nc) {
                    stats.speed_multiplier = 1.5;
                }
                if (stats.cs !== undefined) {
                    if (stats.pc_mods & mods.hr) {
                        stats.cs *= 1.3;
                    }
                    if (stats.pc_mods & mods.ez) {
                        stats.cs *= 0.5;
                    }
                    stats.cs = Math.min(10, stats.cs)
                }
                if (stats.hp !== undefined) {
                    stats.hp *= od_ar_hp_multiplier;
                    stats.hp = Math.min(10, stats.hp)
                }
                if (stats.ar !== undefined) {
                    stats.ar = modify_ar(stats.ar, stats.speed_multiplier, od_ar_hp_multiplier);
                }
                if (stats.od !== undefined) {
                    stats.od = modify_od(stats.od, stats.speed_multiplier, od_ar_hp_multiplier);
                }
                break
            }
            default: throw new TypeError("Mode not supported")
        }
        return stats
    }

    toString() {
        return `CS: ${this.cs.toFixed(2)}, AR: ${this.ar.toFixed(2)}, OD: ${this.od.toFixed(2)}, HP: ${this.hp.toFixed(2)}`
    }
}

// timing point
// ----------------------------------------------------------------
// defines parameters such as timing and sampleset for an interval.
// for pp calculation we only need time and ms_per_beat
//
// it can inherit from its preceeding point by having
// change = false and setting ms_per_beat to a negative value which
// represents the bpm multiplier as ```-100 * bpm_multiplier```
class Timing {
    constructor(values) {
        this.time = values.time || 0.0;
        this.ms_per_beat = values.ms_per_beat;
        if (!this.ms_per_beat) {
            this.ms_per_beat = 600.0;
        }
        this.change = values.change;
        if (!this.change) {
            this.change = true;
        }
    }

    toString() {
        return "{ time: " + this.time.toFixed(2) + ", "
            + "ms_per_beat: " + this.ms_per_beat.toFixed(2) + " }";
    }
}

// circles
// -----------------------------
// all we need from circles is their position. all positions
// stored in the objects are in playfield coordinates (512*384
// rectangle)
class Circle {
    constructor(values) {
        this.pos = values.pos || [0, 0]
    }

    toString() {
        return `Position: [${this.pos[0]}, ${this.pos[1]}]`
    }
}

// sliders
// ----------------------------
// to calculate max combo we need to compute slider ticks
//
// the beatmap stores the distance travelled in one repetition and
// the number of repetitions. this is enough to calculate distance
// per tick using timing information and slider velocity.
//
// note that 1 repetition means no repeats (1 loop)
class Slider {
    constructor(values) {
        this.pos = values.pos || [0, 0];
        this.distance = values.distance || 0;
        this.repetitions = values.repetitions || 1
    }

    toString() {
        return `Position: [${this.pos[0]}, ${this.pos[1]}], distance: ${this.distance.toFixed(2)}, repetitions: ${this.distance}`
    }
}

// generic hitobject
// -----------------------------------------------------------
// the only common property is start time (in millisecond).
// object-specific properties are stored in data, which can be
// an instance of circle, slider, or null
class HitObject {
    constructor(values) {
        this.time = values.time || 0;
        this.type = values.type || 0;
        if (values.data) this.data = values.data
    }

    typeStr() {
        let res = '';
        if (this.type & object_types.circle) res += "circle | ";
        if (this.type & object_types.slider) res += "slider | ";
        if (this.type & object_types.spinner) res += "spinner | ";
        return res.substring(0, Math.max(0, res.length - 3))
    }

    toString() {
        return (
            "{ time: " + this.time.toFixed(2) + ", " +
            "type: " + this.typeStr() +
            (this.data ? ", " + this.data.toString() : "") +
            " }"
        )
    }
}

// Beatmap instance
// ----------------------------------------------
// represents a beatmap with advanced information
class Beatmap {
    constructor() {
        this.reset()
    }

    reset() {
        this.format_version = 1;
        this.mode = 0;
        this.title = this.title_unicode = "";
        this.artist = this.artist_unicode = "";
        this.creator = "";
        this.version = "";
        this.ar = undefined;
        this.cs = this.od = this.hp = 5.0;
        this.sv = this.tick_rate = 1.0;
        this.circles = this.sliders = this.spinners = 0;
        if (!this.objects) {
            this.objects = [];
        } else {
            this.objects.length = 0;
        }
        if (!this.timing_points) {
            this.timing_points = [];
        } else {
            this.timing_points.length = 0;
        }
        return this
    }

    // calculate the max combo of the beatmap
    // --------------------------------------
    // this is given by circles + spinners + sliders * 2
    // (heads and tails) + sliderticks
    //
    // we approximate slider ticks by calculating the
    // playfield pixels per beat for the current section
    // and dividing the total distance travelled by
    // pixels per beat. this gives us the number of beats,
    // which multiplied by the tick rate gives us the
    // tick count.
    max_combo() {
        let res = this.circles + this.spinners;
        let tindex = -1;
        let tnext = Number.NEGATIVE_INFINITY;
        let px_per_beat = 0.0;

        for (let i = 0; i < this.objects.length; ++i) {
            let obj = this.objects[i];
            if (!(obj.type & object_types.slider)) {
                continue;
            }

            // keep track of the current timing point without
            // looping through all of them for every object
            while (obj.time >= tnext) {
                ++tindex;
                if (this.timing_points.length > tindex + 1) {
                    tnext = this.timing_points[tindex + 1].time;
                } else {
                    tnext = Number.POSITIVE_INFINITY;
                }

                let t = this.timing_points[tindex];
                let sv_multiplier = 1.0;
                if (!t.change && t.ms_per_beat < 0) {
                    sv_multiplier = -100.0 / t.ms_per_beat;
                }

                // beatmaps older than format v8 don't apply
                // the bpm multiplier to slider ticks
                if (this.format_version < 8) {
                    px_per_beat = this.sv * 100.0;
                } else {
                    px_per_beat = this.sv * 100.0 * sv_multiplier;
                }
            }

            let sl = obj.data;
            let num_beats = (sl.distance * sl.repetitions) / px_per_beat;

            // subtract an epsilon to prevent accidental
            // ceiling of whole values such as 2.00....1 -> 3 due
            // to rounding errors

            let ticks = Math.ceil(
                (num_beats - 0.1) / sl.repetitions
                * this.tick_rate
            );

            --ticks;
            ticks *= sl.repetitions;
            ticks += sl.repetitions + 1;

            res += Math.max(0, ticks);
        }

        return res;
    }

    toString() {
        let res = this.artist + " - " + this.title + " [";
        if (this.title_unicode || this.artist_unicode) {
            res += "(" + this.artist_unicode + " - "
                + this.title_unicode + ")";
        }
        res += (
            this.version + "] mapped by " + this.creator + "\n"
            + "\n"
            + "AR" + parseFloat(this.ar.toFixed(2)) + " "
            + "OD" + parseFloat(this.od.toFixed(2)) + " "
            + "CS" + parseFloat(this.cs.toFixed(2)) + " "
            + "HP" + parseFloat(this.hp.toFixed(2)) + "\n"
            + this.circles + " circles, "
            + this.sliders + " sliders, "
            + this.spinners + " spinners" + "\n"
            + this.max_combo() + " max combo" + "\n"
        );
        return res;
    }
}

// Beatmap parser
// --------------------------------------
// A beatmap parser with just enough data
// for pp calculation
class Parser {
    constructor() {
        this.map = new Beatmap();
        this.reset()
    }

    reset() {
        this.map.reset();
        this.line = 0;
        this.current_line = '';
        this.last_position = '';
        this.section = ''
    }

    // feed a block of text which will be split into lines
    // partial lines are not allowed
    parse(str) {
        let lines = str.split("\n");
        for (let i = 0; i < lines.length; ++i) {
            this.process_line(lines[i])
        }
        return this
    }

    // line processing
    process_line(line) {
        this.current_line = this.last_position = line;
        ++this.line;

        // comments
        if (line.startsWith(" ") || line.startsWith("_")) {
            return this;
        }

        // now that we've handled space comments we can trim space
        line = this.current_line = line.trim();
        if (line.length <= 0) {
            return this;
        }

        // c++ style comments
        if (line.startsWith("//")) {
            return this;
        }

        // [SectionName]
        if (line.startsWith("[")) {
            if (this.section == "Difficulty" && !this.map.ar) {
                this.map.ar = this.map.od
            }
            this.section = line.substring(1, line.length - 1);
            return this
        }

        if (!line) {
            return this;
        }

        switch (this.section) {
            case "Metadata": this._metadata(); break;
            case "General": this._general(); break;
            case "Difficulty": this._difficulty(); break;
            case "TimingPoints": this._timing_points(); break;
            case "HitObjects": this._objects(); break;
            default:
                let fmtpos = line.indexOf("file format v");
                if (fmtpos < 0) {
                    break;
                }
                this.map.format_version = parseInt(line.substring(fmtpos + 13));
                break;
        }
        return this;
    }

    // (internal)
    // parser tools
    _setpos(str) {
        this.last_position = str.trim();
        return this.last_position;
    }

    _warn() {
        log.warn.apply(null, Array.prototype.slice.call(arguments));
        log.warn(this.toString());
    }

    _property() {
        let s = this.current_line.split(":", 2);
        s[0] = this._setpos(s[0]);
        s[1] = this._setpos(s[1]);
        return s;
    }

    _metadata() {
        let p = this._property();
        switch (p[0]) {
            case "Title":
                this.map.title = p[1];
                break;
            case "TitleUnicode":
                this.map.title_unicode = p[1];
                break;
            case "Artist":
                this.map.artist = p[1];
                break;
            case "ArtistUnicode":
                this.map.artist_unicode = p[1];
                break;
            case "Creator":
                this.map.creator = p[1];
                break;
            case "Version":
                this.map.version = p[1]
        }
    }

    _general() {
        let p = this._property();
        if (p[0] !== "Mode") {
            return;
        }
        this.map.mode = parseInt(this._setpos(p[1]))
    }

    _difficulty() {
        let p = this._property();
        switch (p[0]) {
            case "CircleSize":
                this.map.cs = parseFloat(this._setpos(p[1]));
                break;
            case "OverallDifficulty":
                this.map.od = parseFloat(this._setpos(p[1]));
                break;
            case "ApproachRate":
                this.map.ar = parseFloat(this._setpos(p[1]));
                break;
            case "HPDrainRate":
                this.map.hp = parseFloat(this._setpos(p[1]));
                break;
            case "SliderMultiplier":
                this.map.sv = parseFloat(this._setpos(p[1]));
                break;
            case "SliderTickRate":
                this.map.tick_rate = parseFloat(this._setpos(p[1]))
        }
    }

    _timing_points() {
        let s = this.current_line.split(",");
        if (s.length > 8) {
            this._warn("timing point with trailing values")
        } else if (s.length < 2) {
            return this._warn("ignoring malformed timing point")
        }
        let t = new Timing({
            time: parseFloat(this._setpos(s[0])),
            ms_per_beat: parseFloat(this._setpos(s[1]))
        });
        if (s.length >= 7) {
            t.change = s[6].trim() !== "0";
        }
        this.map.timing_points.push(t);
    }

    _objects() {
        let s = this.current_line.split(",");
        let d;
        if (s.length > 11) {
            this._warn("object with trailing values");
        } else if (s.length < 4) {
            return this._warn("ignoring malformed hitobject")
        }
        let obj = new HitObject({
            time: parseFloat(this._setpos(s[2])),
            type: parseInt(this._setpos(s[3]))
        });
        if (isNaN(obj.time) || isNaN(obj.type)) {
            return this._warn("ignoring malformed hitobject")
        }
        if (obj.type & object_types.circle) {
            ++this.map.circles;
            d = obj.data = new Circle({
                pos: [
                    parseFloat(this._setpos(s[0])),
                    parseFloat(this._setpos(s[1]))
                ]
            });
            if (isNaN(d.pos[0]) || isNaN(d.pos[1])) {
                return this._warn("ignoring malformed circle")
            }
        }
        else if (obj.type & object_types.slider) {
            if (s.length < 8) {
                return this._warn("ignoring malformed slider");
            }
            ++this.map.sliders;
            d = obj.data = new Slider({
                pos: [
                    parseFloat(this._setpos(s[0])),
                    parseFloat(this._setpos(s[1])),
                ],
                repetitions: parseInt(this._setpos(s[6])),
                distance: parseFloat(this._setpos(s[7]))
            });
            if (isNaN(d.pos[0]) || isNaN(d.pos[1]) || isNaN(d.repetitions) || isNaN(d.distance)) {
                return this._warn("ignoring malformed slider");
            }
        }
        else if (obj.type & object_types.spinner) {
            ++this.map.spinners
        }
        this.map.objects.push(obj)
    }
}

// osu!standard hit object with difficulty calculation values
// obj is the underlying hitobject
class StandardDiffHitObject {
    constructor(obj) {
        this.obj = obj;
        this.reset()
    }

    reset() {
        this.strains = [ 0.0, 0.0 ];
        this.normpos = [ 0.0, 0.0 ];
        this.angle = 0.0;
        this.is_single = false;
        this.delta_time = 0.0;
        this.d_distance = 0.0;
        return this
    }

    toString() {
        return `Strains: [${this.strains[0].toFixed(2)}, ${this.strains[1].toFixed(2)}], normpos: [${this.normpos[0].toFixed(2)}, ${this.normpos[1].toFixed(2)}], is_single: ${this.is_single}`
    }
}

// (internal)
// 2D point operations
function vec_sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
function vec_mul(a, b) { return [a[0] * b[0], a[1] * b[1]]; }
function vec_len(v) { return Math.sqrt(v[0] * v[0] + v[1] * v[1]); }
function vec_dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }

// (internal)
// difficulty calculation constants
let DIFF_SPEED = 0;
let DIFF_AIM = 1;
let SINGLE_SPACING = 125.0;
let DECAY_BASE = [ 0.3, 0.15 ];
let WEIGHT_SCALING = [ 1400.0, 26.25 ];
let DECAY_WEIGHT = 0.9;
let STRAIN_STEP = 400.0;
let CIRCLESIZE_BUFF_THRESHOLD = 30.0;
let STAR_SCALING_FACTOR = 0.0675;
let PLAYFIELD_SIZE = [512.0, 384.0];
let PLAYFIELD_CENTER = vec_mul(PLAYFIELD_SIZE, [0.5, 0.5]);
let DROID_EXTREME_SCALING_FACTOR = 0.4;
let EXTREME_SCALING_FACTOR = 0.5;

// (internal)
// spacing weight constants for each difficulty type

// ~200BPM 1/4 streams
let MIN_SPEED_BONUS = 75.0;

// ~280BPM 1/4 streams - edit to fit droid
let DROID_MAX_SPEED_BONUS = 53.0;

// ~330BPM 1/4 streams
let MAX_SPEED_BONUS = 45.0;

let ANGLE_BONUS_SCALE = 90;
let AIM_TIMING_THRESHOLD = 107;
let SPEED_ANGLE_BONUS_BEGIN = 5 * Math.PI / 6;
let AIM_ANGLE_BONUS_BEGIN = Math.PI / 3;

// osu!standard difficulty calculator
// ----------------------------------
// does not account for sliders because slider calculations are
// expensive and not worth the small accuracy increase
class StandardDiff {
    constructor() {
        this.objects = [];
        this.reset();

        this.map = undefined;
        this.mods = '';
        this.singletap_threshold = 125
    }

    reset() {
        // star rating

        this.total = 0.0;
        this.aim = 0.0;
        this.aim_difficulty = 0.0;
        this.aim_length_bonus = 0.0;
        this.speed = 0.0;
        this.speed_difficulty = 0.0;
        this.speed_length_bonus = 0.0;

        // number of notes that are seen as singletaps by the
        // difficulty calculator

        this.singles = 0;

        // number of notes that are faster than the interval given
        // in calculate(). these singletap statistic are not required in
        // star rating, but they are a free byproduct of the
        // calculation which could be useful

        this.singles_threshold = 0;
    }

    _length_bonus(stars, difficulty) {
        return 0.32 + 0.5 * (Math.log10(difficulty + stars) - Math.log10(stars))
    }

    // calculate difficulty and return current instance, which
    // contains the results
    //
    // params:
    // * map: the beatmap we want to calculate difficulty for. if
    //   unspecified, it will default to the last map used
    //   in previous calls.
    // * mods: mods bitmask, defaults to modbits.nomod
    // * singletap_threshold: interval threshold in milliseconds
    //   for singletaps. defaults to 240 bpm 1/2 singletaps
    //   ```(60000 / 240) / 2``` .
    //   see nsingles_threshold
    calculate(params) {
        let map = this.map = params.map || this.map;
        if (!map) {
            throw new TypeError("no map given")
        }
        let mods = this.mods = params.mods || this.mods;
        let singletap_threshold = this.singletap_threshold
            = params.singletap_threshold || this.singletap_threshold;

        let mode = params.mode || "osu";

        // apply mods to the beatmap's stats

        let stats = new MapStats({cs: map.cs, mods: mods}).calculate({mode: mode});
        mods = osudroid.mods.modbits_from_string(mods);

        // droid's CS is already pre-calculated so there is no need
        // to recalculate it. To avoid so, we place the CS in a
        // variable
        let cs;
        switch (mode) {
            case "osu!droid":
            case "droid":
                cs = map.cs;
                break;
            case "osu!":
            case "osu":
                cs = stats.cs
        }

        this._init_objects(this.objects, map, cs);

        let speed = this._calc_individual(mode, DIFF_SPEED, this.objects, stats.speed_multiplier);
        this.speed = speed.difficulty;
        this.speed_difficulty = speed.total;

        let aim = this._calc_individual(mode, DIFF_AIM, this.objects, stats.speed_multiplier);
        this.aim = aim.difficulty;
        this.aim_difficulty = aim.total;

        this.aim_length_bonus = this._length_bonus(this.aim, this.aim_difficulty);
        this.speed_length_bonus = this._length_bonus(this.speed, this.speed_difficulty);
        this.aim = Math.sqrt(this.aim) * STAR_SCALING_FACTOR;
        this.speed = Math.sqrt(this.speed) * STAR_SCALING_FACTOR;

        if (mods & osudroid.mods.td) {
            this.aim = Math.pow(this.aim, 0.8)
        }

        this.total = this.aim + this.speed;

        // total stars mixes speed and aim in such a way that
        // heavily aim or speed focused maps get a bonus
        switch (mode) {
            case "osu!droid":
            case "droid":
                this.total += Math.abs(this.speed - this.aim) * DROID_EXTREME_SCALING_FACTOR;
                break;
            case "osu!":
            case "osu":
                this.total += Math.abs(this.speed - this.aim) * EXTREME_SCALING_FACTOR
        }

        this.singles = 0;
        this.singles_threshold = 0;

        for (let i = 1; i < this.objects.length; ++i) {
            let obj = this.objects[i].obj;
            let prev = this.objects[i - 1].obj;
            if (this.objects[i].is_single) {
                ++this.singles;
            }
            if (!(obj.type & (object_types.circle | object_types.slider))) {
                continue;
            }
            let interval = (obj.time - prev.time) / stats.speed_multiplier;
            if (interval >= singletap_threshold) {
                ++this.singles_threshold;
            }
        }
        return this
    }

    toString() {
        return (
            this.total.toFixed(2) + " stars (" + this.aim.toFixed(2) +
            " aim, " + this.speed.toFixed(2) + " speed)"
        )
    }

    // (internal)
    // calculate spacing weight for a difficulty type
    _spacing_weight(mode, type, distance, delta_time, prev_distance, prev_delta_time, angle) {
        let angle_bonus;
        let strain_time = Math.max(delta_time, 50);

        switch (type) {
            case DIFF_AIM: {
                let prev_strain_time = Math.max(prev_delta_time, 50);
                let result = 0;
                if (angle !== null && angle > AIM_ANGLE_BONUS_BEGIN) {
                    angle_bonus = Math.sqrt(
                        Math.max(prev_distance - ANGLE_BONUS_SCALE, 0.0) *
                        Math.pow(Math.sin(angle - AIM_ANGLE_BONUS_BEGIN), 2.0) *
                        Math.max(distance - ANGLE_BONUS_SCALE, 0.0)
                    );
                    result = 1.5 * Math.pow(Math.max(0.0, angle_bonus), 0.99) /
                        Math.max(AIM_TIMING_THRESHOLD, prev_strain_time);
                }
                let weighted_distance = Math.pow(distance, 0.99);
                return Math.max(
                    result + weighted_distance / Math.max(AIM_TIMING_THRESHOLD, strain_time),
                    weighted_distance / strain_time
                );
            }
            case DIFF_SPEED: {
                distance = Math.min(distance, SINGLE_SPACING);
                switch (mode) {
                    case "osu!droid":
                    case "droid":
                        delta_time = Math.max(delta_time, DROID_MAX_SPEED_BONUS);
                        break;
                    case "osu!":
                    case "osu":
                        delta_time = Math.max(delta_time, MAX_SPEED_BONUS)
                }
                let speed_bonus = 1.0;
                if (delta_time < MIN_SPEED_BONUS) {
                    switch (mode) {
                        case "osu!droid":
                        case "droid":
                            speed_bonus += Math.pow((MIN_SPEED_BONUS - delta_time) / 50.0, 2);
                            break;
                        case "osu!":
                        case "osu":
                            speed_bonus += Math.pow((MIN_SPEED_BONUS - delta_time) / 40.0, 2);
                    }
                }
                angle_bonus = 1;
                if (angle !== null && angle < SPEED_ANGLE_BONUS_BEGIN) {
                    let s = Math.sin(1.5 * (SPEED_ANGLE_BONUS_BEGIN - angle));
                    angle_bonus += Math.pow(s, 2) / 3.57;
                    if (angle < Math.PI / 2.0) {
                        angle_bonus = 1.28;
                        if (distance < ANGLE_BONUS_SCALE && angle < Math.PI / 4.0) {
                            angle_bonus += (1.0 - angle_bonus) *
                                Math.min((ANGLE_BONUS_SCALE - distance) / 10.0, 1.0);
                        }
                        else if (distance < ANGLE_BONUS_SCALE) {
                            angle_bonus += (1.0 - angle_bonus) *
                                Math.min((ANGLE_BONUS_SCALE - distance) / 10.0, 1.0) *
                                Math.sin((Math.PI / 2.0 - angle) * 4.0 / Math.PI);
                        }
                    }
                }
                return (
                    (1 + (speed_bonus - 1) * 0.75) * angle_bonus *
                    (0.95 + speed_bonus * Math.pow(distance / SINGLE_SPACING, 3.5))
                ) / strain_time;
            }
        }
        throw {
            name: "NotImplementedError",
            message: "this difficulty type does not exist"
        }
    }

    // (internal)
    // calculate a single strain and store it in the diffobj
    _calc_strain(mode, type, diffobj, prev_diffobj, speed_mul) {
        let obj = diffobj.obj;
        let prev_obj = prev_diffobj.obj;

        let value = 0.0;
        let time_elapsed = (obj.time - prev_obj.time) / speed_mul;
        let decay = Math.pow(DECAY_BASE[type],
            time_elapsed / 1000.0);

        diffobj.delta_time = time_elapsed;

        if (obj.type & (object_types.slider | object_types.circle)) {
            let distance = vec_len(vec_sub(diffobj.normpos, prev_diffobj.normpos));
            diffobj.d_distance = distance;
            if (type === DIFF_SPEED) {
                diffobj.is_single = distance > SINGLE_SPACING;
            }
            value = this._spacing_weight(mode, type, distance, time_elapsed,
                prev_diffobj.d_distance, prev_diffobj.delta_time, diffobj.angle);
            value *= WEIGHT_SCALING[type];
        }

        diffobj.strains[type] = prev_diffobj.strains[type] * decay + value
    }

    // (internal)
    // calculate a specific type of difficulty
    //
    // the map is analyzed in chunks of STRAIN_STEP duration.
    // for each chunk the highest hitobject strains are added to
    // a list which is then collapsed into a weighted sum, much
    // like scores are weighted on a user's profile.
    //
    // for subsequent chunks, the initial max strain is calculated
    // by decaying the previous hitobject's strain until the
    // beginning of the new chunk
    //
    // the first object doesn't generate a strain
    // so we begin with an incremented interval end
    //
    // also don't forget to manually add the peak strain for the last
    // section which would otherwise be ignored
    _calc_individual(mode, type, diffobjs, speed_mul) {
        let strains = [];
        let strain_step = STRAIN_STEP * speed_mul;
        let interval_end = (
            Math.ceil(diffobjs[0].obj.time / strain_step) * strain_step
        );
        let max_strain = 0.0;
        let i;

        for (i = 0; i < diffobjs.length; ++i) {
            if (i > 0) {
                this._calc_strain(mode, type, diffobjs[i], diffobjs[i - 1],
                    speed_mul);
            }
            while (diffobjs[i].obj.time > interval_end) {
                strains.push(max_strain);
                if (i > 0) {
                    let decay = Math.pow(DECAY_BASE[type],
                        (interval_end - diffobjs[i - 1].obj.time) / 1000.0);
                    max_strain = diffobjs[i - 1].strains[type] * decay;
                } else {
                    max_strain = 0.0;
                }
                interval_end += strain_step
            }
            max_strain = Math.max(max_strain, diffobjs[i].strains[type])
        }

        strains.push(max_strain);

        let weight = 1.0;
        let total = 0.0;
        let difficulty = 0.0;

        strains.sort(function (a, b) { return b - a; });

        for (i = 0; i < strains.length; ++i) {
            total += Math.pow(strains[i], 1.2);
            difficulty += strains[i] * weight;
            weight *= DECAY_WEIGHT;
        }

        return {difficulty: difficulty, total: total};
    }

    // (internal)
    // positions are normalized on circle radius so that we can
    // calc as if everything was the same circlesize.
    //
    // this creates a scaling vector that normalizes positions
    _normalizer_vector(circlesize) {
        let radius = (PLAYFIELD_SIZE[0] / 16.0)
            * (1.0 - 0.7 * (circlesize - 5.0) / 5.0);
        let scaling_factor = 52.0 / radius;

        // high circlesize (small circles) bonus

        if (radius < CIRCLESIZE_BUFF_THRESHOLD) {
            scaling_factor *= 1.0
                + Math.min(CIRCLESIZE_BUFF_THRESHOLD - radius, 5.0) / 50.0;
        }
        return [scaling_factor, scaling_factor];
    }

    // (internal)
    // initialize diffobjs (or reset if already initialized) and
    // populate it with the normalized position of the map's
    // objects
    _init_objects(diffobjs, map, circlesize) {
        if (diffobjs.length != map.objects.length) {
            diffobjs.length = map.objects.length;
        }

        let scaling_vec = this._normalizer_vector(circlesize);
        let normalized_center = vec_mul(PLAYFIELD_CENTER, scaling_vec);

        for (let i = 0; i < diffobjs.length; ++i) {
            if (!diffobjs[i]) {
                diffobjs[i] = new StandardDiffHitObject(map.objects[i]);
            } else {
                diffobjs[i].reset();
            }

            let obj = diffobjs[i].obj;
            if (obj.type & object_types.spinner) {
                diffobjs[i].normpos = normalized_center.slice();
            } else if (obj.type & (object_types.slider | object_types.circle)) {
                diffobjs[i].normpos = vec_mul(obj.data.pos, scaling_vec);
            }
            if (i >= 2) {
                let prev1 = diffobjs[i - 1];
                let prev2 = diffobjs[i - 2];
                let v1 = vec_sub(prev2.normpos, prev1.normpos);
                let v2 = vec_sub(diffobjs[i].normpos, prev1.normpos);
                let dot = vec_dot(v1, v2);
                let det = v1[0] * v2[1] - v1[1] * v2[0];
                diffobjs[i].angle = Math.abs(Math.atan2(det, dot));
            } else {
                diffobjs[i].angle = null;
            }
        }
    }
}

// generic star rating calculator
class MapStars {
    constructor() {
        this.droid_stars = 0;
        this.pc_stars = 0
    }

    // calculates star rating of a map
    // ------------------------------------
    // params:
    //  file: osu file of the beatmap
    //  mods: applied mods
    calculate(params) {
        let osu_file = params.file;
        if (!osu_file) {
            console.log("Invalid osu file");
            return this
        }
        let pmod = params.mods;
        if (!pmod) {
            pmod = '';
        }

        let nparser = new Parser();
        let pcparser = new Parser();
        try {
            nparser.parse(osu_file);
            pcparser.parse(osu_file)
        } catch (e) {
            console.log("Invalid osu file");
            return this
        }
        let nmap = nparser.map;
        let pcmap = pcparser.map;

        let stats = new MapStats({
            cs: nmap.cs,
            ar: nmap.ar,
            od: nmap.od,
            hp: nmap.hp,
            mods: pmod
        }).calculate({mode: "droid"});

        let droid_mod = mods.modbits_from_string(pmod);
        if (!(droid_mod & mods.td)) {
            droid_mod += mods.td
        }
        if (droid_mod & mods.hr) {
            droid_mod -= mods.hr
        }
        if (droid_mod & mods.ez) {
            droid_mod -= mods.ez
        }
        droid_mod = mods.modbits_to_string(droid_mod);

        nmap.cs = stats.cs;
        nmap.ar = stats.ar;
        nmap.od = stats.od;

        this.droid_stars = new StandardDiff().calculate({mode: "droid", map: nmap, mods: droid_mod});
        this.pc_stars = new StandardDiff().calculate({mode: "osu", map: pcmap, mods: pmod});

        return this
    }

    toString() {
        return `${this.droid_stars.toString()}\n${this.pc_stars.toString()}`
    }
}

// pp calculation
// ----------------------------------------------------------------

// osu!standard accuracy calculator
//
// if percent and nobjects are specified, n300, n100 and n50 will
// be automatically calculated to be the closest to the given
// acc percent
class Accuracy {
    constructor(values) {
        this.nmiss = values.nmiss || 0;

        if (values.n300 === undefined) {
            this.n300 = -1;
        } else {
            this.n300 = values.n300;
        }

        this.n100 = values.n100 || 0;
        this.n50 = values.n50 || 0;

        let nobjects;

        if (values.nobjects) {
            let n300 = this.n300;
            nobjects = values.nobjects;
            let hitcount;

            if (n300 < 0) {
                n300 = Math.max(0, nobjects - this.n100 - this.n50 - this.nmiss);
            }

            hitcount = n300 + this.n100 + this.n50 + this.nmiss;

            if (hitcount > nobjects) {
                n300 -= Math.min(n300, hitcount - nobjects);
            }

            hitcount = n300 + this.n100 + this.n50 + this.nmiss;

            if (hitcount > nobjects) {
                this.n100 -= Math.min(this.n100, hitcount - nobjects);
            }

            hitcount = n300 + this.n100 + this.n50 + this.nmiss;

            if (hitcount > nobjects) {
                this.n50 -= Math.min(this.n50, hitcount - nobjects);
            }

            hitcount = n300 + this.n100 + this.n50 + this.nmiss;

            if (hitcount > nobjects) {
                this.nmiss -= Math.min(this.nmiss, hitcount - nobjects);
            }

            this.n300 = nobjects - this.n100 - this.n50 - this.nmiss;
        }

        if (values.percent) {
            nobjects = values.nobjects;
            if (!nobjects) {
                throw new TypeError("nobjects is required when specifying percent");
            }

            let max300 = nobjects - this.nmiss;

            let maxacc = new Accuracy({
                n300: max300, n100: 0, n50: 0, nmiss: this.nmiss
            }).value() * 100.0;

            let acc_percent = values.percent;
            acc_percent = Math.max(0.0, Math.min(maxacc, acc_percent));

            // just some black magic maths from wolfram alpha

            this.n100 = Math.round(
                -3.0 * ((acc_percent * 0.01 - 1.0) * nobjects + this.nmiss) * 0.5
            );

            if (this.n100 > max300) {
                // acc lower than all 100s, use 50s
                this.n100 = 0;
                this.n50 = Math.round(
                    -6.0 * ((acc_percent * 0.01 - 1.0) * nobjects + this.nmiss) * 0.5
                );
                this.n50 = Math.min(max300, this.n50);
            }

            this.n300 = nobjects - this.n100 - this.n50 - this.nmiss;
        }
    }

    // computes the accuracy value (0.0-1.0)
    //
    // if n300 was specified in the constructor, nobjects is not
    // required and will be automatically computed
    value(nobjects) {
        let n300 = this.n300;
        if (n300 < 0) {
            if (!nobjects) {
                throw new TypeError("either n300 or nobjects must be specified");
            }
            n300 = nobjects - this.n100 - this.n50 - this.nmiss;
        } else {
            nobjects = n300 + this.n100 + this.n50 + this.nmiss;
        }
        let res = (
            (n300 * 300.0 + this.n100 * 100.0 + this.n50 * 50.0) /
            (nobjects * 300.0)
        );
        return Math.max(0, Math.min(res, 1.0));
    }

    toString() {
        return (
            (this.value() * 100.0).toFixed(2) + "% "
            + this.n100 + "x100 " + this.n50 + "x50 "
            + this.nmiss + "xmiss"
        )
    }
}

// pp calculator
class MapPP {
    constructor() {
        this.aim = 0.0;
        this.speed = 0.0;
        this.acc = 0.0;
        this.computed_accuracy = undefined
    }

    // metaparams:
    // map, stars, acc_percent
    //
    // params:
    // aim_stars, speed_stars, max_combo, nsliders, ncircles,
    // nobjects, base_ar = 5, base_od = 5, mode = 0,
    // mods = "", combo = max_combo - nmiss,
    // n300 = nobjects - n100 - n50 - nmiss, n100 = 0, n50 = 0,
    // nmiss = 0, score_version = 1
    //
    // if stars is defined, map and mods are obtained from stars as
    // well as aim_stars and speed_stars
    //
    // if map is defined, max_combo, nsliders, ncircles, nobjects,
    // base_ar, base_od will be obtained from this beatmap
    //
    // if map is defined and stars is not defined, a new difficulty
    // calculator will be created on the fly to compute stars for map
    //
    // if acc_percent is defined, n300, n100, n50 will be automatically
    // calculated to be as close as possible to this value
    calculate(params) {
        // parameters handling

        let stars = params.stars;
        let map = params.map;
        let max_combo, nsliders, ncircles, nobjects, base_ar, base_od;
        let mods;
        let aim_stars, speed_stars;
        let mode = params.mode || "osu";

        if (stars) {
            map = stars.map;
        }

        if (map) {
            max_combo = map.max_combo();
            nsliders = map.sliders;
            ncircles = map.circles;
            nobjects = map.objects.length;
            base_ar = map.ar;
            base_od = map.od;

            if (!stars) {
                stars = new StandardDiff().calculate(params);
            }
        } else {
            max_combo = params.max_combo;
            if (!max_combo || max_combo < 0) {
                throw new TypeError("max_combo must be > 0");
            }

            nsliders = params.nsliders;
            ncircles = params.ncircles;
            nobjects = params.nobjects;
            if ([nsliders, ncircles, nobjects].some(isNaN)) {
                throw new TypeError(
                    "nsliders, ncircles, nobjects are required (must be numbers) "
                );
            }
            if (nobjects < nsliders + ncircles) {
                throw new TypeError(
                    "nobjects must be >= nsliders + ncircles"
                );
            }
            base_ar = params.base_ar;
            if (!base_ar) base_ar = 5;
            base_od = params.base_od;
            if (!base_od) base_od = 5
        }

        if (stars) {
            mods = stars.mods;
            aim_stars = stars.aim;
            speed_stars = stars.speed;
        } else {
            mods = params.mods || '';
            aim_stars = params.aim_stars;
            speed_stars = params.speed_stars;
        }

        if ([aim_stars, speed_stars].some(isNaN)) {
            throw new TypeError("aim and speed stars required (must be numbers)");
        }

        let nmiss = params.nmiss || 0;
        let n50 = params.n50 || 0;
        let n100 = params.n100 || 0;

        let n300 = params.n300;
        if (!n300) {
            n300 = nobjects - n100 - n50 - nmiss;
        }

        let combo = params.combo;
        if (!combo) {
            combo = max_combo - nmiss;
        }

        let score_version = params.score_version || 1;

        let nobjects_over_2k = nobjects / 2000.0;
        let length_bonus = 0.95 + 0.4 * Math.min(1.0, nobjects_over_2k);
        switch (mode) {
            case "osu!droid":
            case "droid":
                length_bonus = 1.650668 +
                    (0.4845796 - 1.650668) /
                    (1 + Math.pow(nobjects / 817.9306, 1.147469));
                break;
            case "osu!":
            case "osu":
                if (nobjects > 2000) {
                    length_bonus += Math.log10(nobjects_over_2k) * 0.5;
                }
        }

        let miss_penality = Math.pow(0.97, nmiss);
        let combo_break = Math.min(Math.pow(combo, 0.8) / Math.pow(max_combo, 0.8), 1.0);
        let mapstats = new MapStats({
            ar: base_ar,
            od: base_od,
            mods: mods
        });

        // droid's map stats are pre-calculated so there is no need to calculate again
        if (mode == "osu!" || mode == "osu") mapstats = mapstats.calculate({mode: mode});
        mods = osudroid.mods.modbits_from_string(mods);

        this.computed_accuracy = new Accuracy({
            percent: params.acc_percent,
            nobjects: nobjects,
            n300: n300, n100: n100, n50: n50, nmiss: nmiss
        });

        n300 = this.computed_accuracy.n300;
        n100 = this.computed_accuracy.n100;
        n50 = this.computed_accuracy.n50;

        let accuracy = this.computed_accuracy.value();

        // high/low AR bonus
        let ar_bonus = 1.0;
        if (mapstats.ar > 10.33) {
            ar_bonus += 0.3 * (mapstats.ar - 10.33);
        } else if (mapstats.ar < 8.0) {
            ar_bonus += 0.01 * (8.0 - mapstats.ar);
        }

        // aim pp
        let aim = this._base(aim_stars);
        aim *= length_bonus;
        aim *= miss_penality;
        aim *= combo_break;
        aim *= ar_bonus;

        let hd_bonus = 1.0;
        if (mods & osudroid.mods.hd) {
            hd_bonus *= 1.0 + 0.04 * (12.0 - mapstats.ar);
        }

        aim *= hd_bonus;

        if (mods & osudroid.mods.fl) {
            let fl_bonus = 1.0 + 0.35 * Math.min(1.0, nobjects / 200.0);
            if (nobjects > 200) {
                fl_bonus += 0.3 * Math.min(1.0, (nobjects - 200) / 300.0);
            }
            if (nobjects > 500) {
                fl_bonus += (nobjects - 500) / 1200.0;
            }
            aim *= fl_bonus;
        }

        let acc_bonus = 0.5 + accuracy / 2.0;
        let od_squared = Math.pow(mapstats.od, 2);
        let od_bonus = 0.98 + od_squared / 2500.0;

        aim *= acc_bonus;
        aim *= od_bonus;

        this.aim = aim;

        // speed pp
        let speed = this._base(speed_stars);
        speed *= length_bonus;
        speed *= miss_penality;
        speed *= combo_break;
        if (mapstats.ar > 10.33) {
            speed *= ar_bonus;
        }
        speed *= hd_bonus;

        // similar to aim acc and od bonus

        speed *= 0.02 + accuracy;
        speed *= 0.96 + od_squared / 1600.0;

        this.speed = speed;

        // accuracy pp
        //
        // scorev1 ignores sliders and spinners since they are free
        // 300s

        let real_acc = accuracy;
        switch (score_version) {
            case 1:
                let nspinners = nobjects - nsliders - ncircles;
                real_acc = new Accuracy({
                    n300: Math.max(0, n300 - nsliders - nspinners),
                    n100: n100,
                    n50: n50,
                    nmiss: nmiss
                }).value();
                real_acc = Math.max(0.0, real_acc);
                break;
            case 2:
                ncircles = nobjects;
                break;
            default:
                throw {
                    name: "NotImplementedError",
                    message: "unsupported scorev" + score_version
                }
        }

        let acc;
        switch (mode) {
            case "osu!droid":
            case "droid":
                // drastically change acc calculation to fit droid meta
                acc = (
                    Math.pow(1.4, mapstats.od) *
                    Math.pow(Math.max(1, mapstats.ar / 10), 3) *
                    Math.pow(real_acc, 12.0) * 10
                );
                break;
            case "osu!":
            case "osu":
                acc = (
                    Math.pow(1.52163, mapstats.od) *
                    Math.pow(real_acc, 24.0) * 2.83
                )
        }

        acc *= Math.min(1.15, Math.pow(ncircles / 1000.0, 0.3));
        if (mods & osudroid.mods.hd) {
            acc *= 1.08;
        }
        if (mods & osudroid.mods.fl) {
            acc *= 1.02;
        }

        this.acc = acc;

        // total pp
        let final_multiplier;
        switch (mode) {
            case "osu!droid":
            case "droid":
                // slight buff to final value
                final_multiplier = 1.15;
                break;
            case "osu!":
            case "osu":
                final_multiplier = 1.12
        }
        if (mods & osudroid.mods.nf) final_multiplier *= 0.90;
        if (mods & osudroid.mods.so) final_multiplier *= 0.95;

        // Extreme penalty
        // =======================================================
        // added to penaltize map with little aim but ridiculously
        // high speed value (which is easily abusable by using more than 2 fingers)
        //
        // only for droid
        let extreme_penalty = Math.pow(
            1 - Math.abs(speed - Math.pow(aim,1.1)) /
            Math.max(speed, Math.pow(aim,1.1)),
            0.2
        );
        extreme_penalty = Math.max(
            Math.pow(extreme_penalty , 2),
            -2 * (Math.pow(1 - extreme_penalty, 2)) + 1
        );

        this.total = Math.pow(
            Math.pow(aim, 1.1) + Math.pow(speed, 1.1) +
            Math.pow(acc, 1.1),
            1.0 / 1.1
        ) * final_multiplier;

        if (mode == "osu!droid" || mode == "droid") {
            this.total *= extreme_penalty;
        }

        return this
    }

    toString() {
        return (
            this.total.toFixed(2) + " pp (" + this.aim.toFixed(2)
            + " aim, " + this.speed.toFixed(2) + " speed, "
            + this.acc.toFixed(2) + " acc)"
        );
    }

    // (internal) base pp value for stars
    _base(stars) {
        return (
            Math.pow(5.0 * Math.max(1.0, stars / 0.0675) - 4.0, 3.0) / 100000.0
        );
    }
}

// ppv2 calculator
// ========================================
// if stars is not defined, osu file must
// be defined to calculate map stars on fly
//
// specify mode to switch between
// osu!droid pp and osu! pp
function ppv2(params) {
    if (!params.acc_percent || params.acc_percent < 0 || params.acc_percent > 100) params.acc_percent = 100;
    params.miss = params.miss ? params.miss : 0;
    if (params.miss < 0) params.miss = 0;

    if (!params.stars) {
        let star = new MapStars().calculate(params);
        switch (params.mode) {
            case "osu!droid":
            case "droid": params.stars = star.droid_stars; break;
            case "osu!":
            case "osu": params.stars = star.pc_stars; break;
            default: throw new TypeError("Mode is not supported")
        }
    }
    if (!params.combo) params.combo = params.stars.map.max_combo();
    return new MapPP().calculate({
        stars: params.stars,
        combo: params.combo,
        acc_percent: params.acc_percent,
        nmiss: params.miss,
        mode: params.mode
    })
}

// exports
// ----------------------------------------------------------------

osudroid.PlayerInfo = PlayerInfo;
osudroid.object_types = object_types;
osudroid.MapInfo = MapInfo;
osudroid.mods = mods;
osudroid.rankImage = rankImage;
osudroid.MapStats = MapStats;
osudroid.Timing = Timing;
osudroid.Circle = Circle;
osudroid.Slider = Slider;
osudroid.HitObject = HitObject;
osudroid.Beatmap = Beatmap;
osudroid.Parser = Parser;
osudroid.StandardDiffHitObject = StandardDiffHitObject;
osudroid.StandardDiff = StandardDiff;
osudroid.MapStars = MapStars;
osudroid.Accuracy = Accuracy;
osudroid.MapPP = MapPP;
osudroid.ppv2 = ppv2

})();
