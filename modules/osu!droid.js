// this is a library that I wrote in order to clean some code
// in commands, do note that even though this library is open
// to public, you need an osu!droid API key to access player info

const http = require('http');
const https = require('https');
require('dotenv').config();
const droidapikey = process.env.DROID_API_KEY;
const apikey = process.env.OSU_API_KEY;
const droid = require('./ojsamadroid');
const osu = require('ojsama');
const request = require('request');

let osudroid = {};
if (typeof exports !== 'undefined') osudroid = exports;

(function() {

function PlayerInfo() {
    this.uid = 0;
    this.name = null;
    this.avatarURL = null;
    this.location = null;
    this.email = null;
    this.rank = 0;
    this.score = 0;
    this.accuracy = 0;
    this.play_count = 0;
    this.recent_plays = null;
}

// retrieves a player's info based on uid or username
// ==================================================
// returns a callback of the player's statistics
PlayerInfo.prototype.get = function(params, callback) {
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
            if (headerres[0] == 'FAILED') return callback(this);
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
            let recent_plays = obj.recent ? obj.recent : null;
            this.uid = uid;
            this.name = name;
            this.score = total_score;
            this.email = email;
            this.play_count = play_count;
            this.accuracy = acc;
            this.rank = rank;
            this.recent_plays = recent_plays;

            let avatar_page = {
                host: "ops.dgsrz.com",
                port: 80,
                path: `/profile.php?uid=${uid}`
            };
            let avatar_content = '';
            let avatar_req = http.request(avatar_page, avatar_res => {
                avatar_res.setTimeout(10000);
                avatar_res.setEncoding("utf8");
                avatar_res.on("data", avatar_chunk => {
                    avatar_content += avatar_chunk
                });
                avatar_res.on("error", avatar_err => {
                    console.log("Error retrieving player location and avatar");
                    console.log(avatar_err);
                    return callback(this)
                });
                avatar_res.on("end", () => {
                    let b = avatar_content.split("\n");
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
            });
            avatar_req.end()
        })
    });
    req.end()
};

PlayerInfo.prototype.toString = function() {
    return `Username: ${this.name}\nUID: ${this.uid}\nRank: ${this.rank}\nScore: ${this.score}\nPlay count: ${this.play_count}`
};

function MapInfo() {
    this.title = null;
    this.full_title = null;
    this.artist = null;
    this.creator = null;
    this.version = null;
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
    this.diff_aim = 0;
    this.diff_speed = 0;
    this.diff_total = 0;
    this.hash = null;
    this.osu_file = null;
}

// retrieves a map's information, then outputs a callback
MapInfo.prototype.get = function(params, callback) {
    let beatmapid = params.beatmap_id;
    let hash = params.hash;

    let options;
    if (beatmapid) options = new URL(`https://osu.ppy.sh/api/get_beatmaps?k=${apikey}&b=${beatmapid}`);
    else if (hash) options = new URL(`https://osu.ppy.sh/api/get_beatmaps?k=${apikey}&h=${hash}`);
    else throw new TypeError("Beatmap ID or MD5 hash must be defined");

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
            if (mapinfo.mode != 0) return callback(this);
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
            this.diff_aim = mapinfo.diff_aim ? parseFloat(mapinfo.diff_aim) : 0;
            this.diff_speed = mapinfo.diff_speed ? parseFloat(mapinfo.diff_speed) : 0;
            this.diff_total = mapinfo.difficultyrating ? parseFloat(mapinfo.difficultyrating) : 0;
            this.hash = mapinfo.file_md5;
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
};

function timeString(second) {
    return [Math.floor(second / 60), Math.ceil(second - Math.floor(second / 60) * 60).toString().padStart(2, "0")].join(":")
}

// converts a map's bpm if speed-changing mod is applied
MapInfo.prototype.bpmConvert = function(mod) {
    let bpm = this.bpm;
    if (mod && mod != '-') {
        if (mod.includes("d") || mod.includes("DT")) bpm *= 1.5;
        if (mod.includes("c") || mod.includes("NC")) bpm *= 1.39;
        if (mod.includes("t") || mod.includes("HT")) bpm *= 0.75
    }
    return `${this.bpm}${this.bpm == bpm ? "" : ` (${bpm.toFixed(2)})`}`
};

// converts map status into human-readable data
MapInfo.prototype.statusConvert = function() {
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
};

// converts map length if speed-changing mod is applied
MapInfo.prototype.timeConvert = function(mod) {
    let hitlength = this.hit_length;
    let maplength = this.total_length;
    if (mod && mod != '-') {
        if (mod.includes("d") || mod.includes("DT")) {
            hitlength = Math.ceil(hitlength / 1.5);
            maplength = Math.ceil(maplength / 1.5);
        }
        if (mod.includes("c") || mod.includes("NC")) {
            hitlength = Math.ceil(hitlength / 1.39);
            maplength = Math.ceil(maplength / 1.39);
        }
        if (mod.includes("t") || mod.includes("HT")) {
            hitlength = Math.ceil(hitlength * 4/3);
            maplength = Math.ceil(maplength * 4/3);
        }
    }
    return `${timeString(this.hit_length)}${this.hit_length == hitlength ? "" : ` (${timeString(hitlength)})`}/${timeString(this.total_length)}${this.total_length == maplength ? "" : ` (${timeString(maplength)})`}`
};

// shows the map's statistics
// =================================================
// mode 0: return map title and mods used if defined
// mode 1: return map download link to official web, bloodcat, sayobot
// mode 2: return CS, AR, OD, HP
// mode 3: return BPM, map length, max combo
// mode 4: return last update date and map status
// mode 5: return favorite count and play count
MapInfo.prototype.showStatistics = function(mods = "", option) {
    this.mods = mods;
    let mapstat = new MapStats(this).calculate({mods: mods, mode: 'osu'});
    switch (option) {
        case 0: return `${this.full_title}${mods ? ` +${mods}` : ""}`;
        case 1: return `**Download**: [osu!](https://osu.ppy.sh/beatmapsets/${this.beatmapset_id}/download) ([no video](https://osu.ppy.sh/beatmapsets/${this.beatmapset_id}/download?noVideo=1)) - [Bloodcat](https://bloodcat.com/osu/_data/beatmaps/${this.beatmapset_id}.osz) - [sayobot](https://osu.sayobot.cn/osu.php?s=${this.beatmapset_id})`;
        case 2: return `**CS**: ${this.cs}${this.cs == mapstat.cs ? "": ` (${mapstat.cs})`} - **AR**: ${this.ar}${this.ar == mapstat.ar ? "": ` (${mapstat.ar})`} - **OD**: ${this.od}${this.od == mapstat.od ? "": ` (${mapstat.od})`} - **HP**: ${this.hp}${this.hp == mapstat.hp ? "": ` (${mapstat.hp})`}`;
        case 3: return `**BPM**: ${this.bpmConvert(this.mods)} - **Length**: ${this.timeConvert(this.mods)} - **Max Combo**: ${this.max_combo}x`;
        case 4: return `**Last Update**: ${this.last_update} | **${this.statusConvert()}**`;
        case 5: return `❤️ **${this.favorites.toLocaleString()}** - ▶️ **${this.plays.toLocaleString()}**`;
        default: throw {
            name: "NotSupportedError",
            message: `This mode (${option}) is not supported`
        }
    }
};

// returns a color integer based on ranked status
// =========================================
// useful to make embed messages
MapInfo.prototype.statusColor = function() {
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
};

// calculates droid max score of a map
// ===================================
// code to count amount of ticks are
// mainly copied from ojsama
MapInfo.prototype.max_score = function(mod = "") {
    if (!this.osu_file) return 0;
    if (mod != mod.toUpperCase()) mod = mods.droid_to_PC(mod);
    let diff_multiplier = 1 + this.od / 10 + this.hp / 10 + (this.cs - 3) / 4;

    let score_multiplier = 1;
    if (mod.includes("HD")) score_multiplier *= 1.06;
    if (mod.includes("HR")) score_multiplier *= 1.06;
    if (mod.includes("DT")) score_multiplier *= 1.12;
    if (mod.includes("NC")) score_multiplier *= 1.12;
    if (mod.includes("NF")) score_multiplier *= 0.5;
    if (mod.includes("EZ")) score_multiplier *= 0.5;
    if (mod.includes("HT")) score_multiplier *= 0.3;

    let lines = this.osu_file.split("\n");
    let combo = 0;
    let score = 0;
    let section = '';
    let slider_velocity = 1;
    let tick_rate = 1;
    let timing_points = [];
    let format_version = 1;
    let object_types = {
        circle: 1<<0,
        slider: 1<<1,
        spinner: 1<<3,
    };

    for (let i = 0; i < lines.length; ++i) {
        let line = lines[i];
        // comments
        if (line.startsWith(" ") || line.startsWith("_")) continue;

        // space trim and C++ style comments
        line = line.trim();
        if (!line || line.length <= 0 || line.startsWith("//")) continue;

        // [SectionName]
        if (line.startsWith("[")) {
            // support for old maps
            if (section == "Difficulty" && this.ar == 0) this.ar = this.od;
            section = line.substring(1, line.length - 1);
            continue
        }

        switch (section) {
            case "Difficulty": {
                let data = line.split(":", 2);
                switch (data[0]) {
                    case "SliderMultiplier":
                        slider_velocity = parseFloat(data[1]);
                        break;
                    case "SliderTickRate":
                        tick_rate = parseFloat(data[1]);
                        break;
                    default:
                        continue
                }
                break
            }
            case "TimingPoints": {
                let data = line.split(",");
                let t = {
                    time: parseFloat(data[0]),
                    ms_per_beat: parseFloat(data[1]),
                    change: true
                };
                if (data.length > 7) t.change = data[6].trim() !== "0";
                timing_points.push(t);
                continue
            }
            default: {
                let fmtpos = line.indexOf("file format v");
                if (fmtpos < 0) break;
                format_version = parseInt(line.substring(fmtpos + 13))
            }
        }

        if (section != "HitObjects") continue;
        let entry = line.split(",");

        let object = {
            time: parseInt(entry[2]),
            type: parseInt(entry[3]),
            repetitions: parseInt(entry[6]),
            distance: parseFloat(entry[7])
        };

        // circles and spinners score calculation
        if (!(object.type & object_types.slider)) {
            score += Math.floor(300 + 300 * combo * diff_multiplier * score_multiplier / 25);
            combo++;
            continue
        }

        // sliders score calculation (must account for slider head, reverse, end, and slider ticks)
        let tindex = -1;
        let tnext = Number.NEGATIVE_INFINITY;
        let px_per_beat = 0;

        while (object.time >= tnext) {
            ++tindex;
            if (timing_points.length > tindex + 1) tnext = timing_points[tindex + 1].time;
            else tnext = Number.POSITIVE_INFINITY;

            let t = timing_points[tindex];
            let sv_multiplier = 1.0;
            if (!t.change && t.ms_per_beat < 0) sv_multiplier = -100 / t.ms_per_beat;

            if (format_version < 8) px_per_beat = slider_velocity * 100;
            else px_per_beat = slider_velocity * 100 * sv_multiplier;
        }

        let num_beats = object.distance * object.repetitions / px_per_beat;
        let ticks = Math.ceil((num_beats - 0.1) / object.repetitions * tick_rate);

        --ticks;
        let tick_count = Math.max(0, ticks * object.repetitions);

        score += 30 * object.repetitions + 10 * tick_count;

        combo += tick_count + object.repetitions;
        score += Math.floor(300 + 300 * combo * diff_multiplier * score_multiplier / 25);
        combo++
    }
    return score
};

MapInfo.prototype.toString = function() {
    return `${this.full_title}\nCS: ${this.cs} - AR: ${this.ar} - OD: ${this.od} - HP: ${this.hp}
    \nBPM: ${this.bpm} - Length: ${this.hit_length}/${this.total_length} - Max Combo: ${this.max_combo}
    \nLast Update: ${this.last_update}`
};

let mods = {
    // droid
    n: 1<<0, // NF
    e: 1<<1, // EZ
    h: 1<<3, // HD
    r: 1<<4, // HR
    d: 1<<6, // DT
    t: 1<<8, // HT
    c: 1<<9, // NC

    // pc
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
    so: 1<<12
};

// convert droid mod string to modbits
mods.droid_to_modbits = function(mod) {
    let modbits = 4;
    if (!mod || mod == '-') return modbits;
    mod = mod.toLowerCase();
    while (mod != '') {
        for (let property in mods) {
            if (property.length != 1) continue;
            if (!mods.hasOwnProperty(property)) continue;
            if (mod.startsWith(property)) {
                modbits |= mods[property];
                break
            }
        }
        mod = mod.substr(1)
    }
    return modbits
};

// converts droid mod string to PC mod string
// ============================================
// you can choose to return a detailed response
mods.droid_to_PC = function(mod, detailed = false) {
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
        if (count > 1) return res.trimRight().split(" ").join(", ");
        else return res.trimRight()
    }
    let modbits = 0;
    while (mod != '') {
        for (let property in mods) {
            if (property.length != 1) continue;
            if (!mods.hasOwnProperty(property)) continue;
            if (mod.startsWith(property)) {
                modbits |= mods[property];
                break
            }
        }
        mod = mod.substr(1)
    }
    return this.modbits_to_string(modbits)
};

// construct the mods bitmask from a string such as "HDHR"
// thanks Francesco
mods.modbits_from_string = function(str) {
    let mask = 0;
    str = str.toLowerCase();
    while (str != "") {
        let nchars = 1;
        for (let property in mods) {
            if (property.length != 2) continue;
            if (!mods.hasOwnProperty(property)) continue;
            if (str.startsWith(property)) {
                mask |= mods[property];
                nchars = 2;
                break
            }
        }
        str = str.slice(nchars)
    }
    return mask
};

// convert mods bitmask into a string, such as "HDHR"
// again thanks Francesco
mods.modbits_to_string = function(mod) {
    let res = "";
    for (let property in mods) {
        if (property.length != 2) continue;
        if (!mods.hasOwnProperty(property)) continue;
        if (mod & mods[property]) res += property.toUpperCase()
    }
    if (res.indexOf("DT") >= 0 && res.indexOf("NC") >= 0) res = res.replace("DT", "");
    return res
};

mods.speed_changing = mods.d | mods.t | mods.c | mods.dt | mods.ht | mods.nc;
mods.map_changing = mods.e | mods.h | mods.ez | mods.hr | mods.speed_changing;

let rankImage = {
    S: "http://ops.dgsrz.com/assets/images/ranking-S-small.png",
    A: "http://ops.dgsrz.com/assets/images/ranking-A-small.png",
    B: "http://ops.dgsrz.com/assets/images/ranking-B-small.png",
    C: "http://ops.dgsrz.com/assets/images/ranking-C-small.png",
    D: "http://ops.dgsrz.com/assets/images/ranking-D-small.png",
    SH: "http://ops.dgsrz.com/assets/images/ranking-SH-small.png",
    X: "http://ops.dgsrz.com/assets/images/ranking-X-small.png",
    XH: "http://ops.dgsrz.com/assets/images/ranking-XH-small.png"
};

rankImage.get = function(rank) {
    if (this.hasOwnProperty(rank)) return this[rank];
    else return "Unknown"
};

let OD0_MS = 80;
let OD10_MS = 20;
let AR0_MS = 1800.0;
let AR5_MS = 1200.0;
let AR10_MS = 450.0;

let OD_MS_STEP = (OD0_MS - OD10_MS) / 10.0;
let AR_MS_STEP1 = (AR0_MS - AR5_MS) / 5.0;
let AR_MS_STEP2 = (AR5_MS - AR10_MS) / 5.0;

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

function MapStats(values = {}) {
    this.cs = values.hasOwnProperty("cs") ? values.cs : 0;
    this.ar = values.hasOwnProperty("ar") ? values.ar : 0;
    this.od = values.hasOwnProperty("od") ? values.od : 0;
    this.hp = values.hasOwnProperty("hp") ? values.hp : 0;
    this.droid_mods = values.hasOwnProperty("mods") ? mods.modbits_from_string(values.mods) + 4 : 4;
    this.pc_mods = this.droid_mods - 4
}

// calculates map statistics with mods applied
// ===========================================
// specify mode (droid or osu) to switch between
// osu!droid stats and osu! stats
MapStats.prototype.calculate = function(params = {}) {
    if (params.mods) this.mods = params.mods;
    let stats = new MapStats(this);
    if ([stats.cs, stats.ar, stats.od, stats.hp].some(isNaN)) throw new TypeError("CS, AR, OD, and HP must be defined");
    let speed_mul = 1;
    let od_ar_hp_multiplier = 1;
    if ((stats.droid_mods & mods.d) | (stats.pc_mods & mods.dt)) speed_mul = 1.5;
    if ((stats.droid_mods & mods.t) | (stats.pc_mods & mods.ht)) speed_mul *= 0.75;
    if ((stats.droid_mods & mods.r) | (stats.pc_mods & mods.hr)) od_ar_hp_multiplier = 1.4;
    if ((stats.droid_mods & mods.e) | (stats.pc_mods & mods.ez)) od_ar_hp_multiplier *= 0.5;
    switch (params.mode) {
        case "osu!droid":
        case "droid": {
            let droidtoMS = 75 + 5 * (5 - stats.od);
            if (params.mods.includes("PR")) droidtoMS = 55 + 6 * (5 - stats.od);
            stats.od = 5 - (droidtoMS - 50) / 6;
            stats.cs -= 4;
            if (!(stats.droid_mods & mods.map_changing)) return stats;

            // In droid pre-1.6.8, NC speed multiplier is assumed bugged (1.39)
            if ((stats.droid_mods & mods.c) | (stats.droid_mods & mods.nc)) speed_mul = 1.39;

            if ((stats.droid_mods & mods.r) | (stats.droid_mods & mods.hr)) ++stats.cs;
            if ((stats.droid_mods & mods.e) | (stats.droid_mods & mods.ez)) --stats.cs;
            stats.cs = Math.min(10, stats.cs);

            stats.hp *= od_ar_hp_multiplier;
            stats.hp = Math.min(10, stats.hp);

            stats.ar = modify_ar(stats.ar, speed_mul, od_ar_hp_multiplier);

            stats.cs = parseFloat(stats.cs.toFixed(2));
            stats.ar = parseFloat(stats.ar.toFixed(2));
            stats.od = parseFloat(stats.od.toFixed(2));
            stats.hp = parseFloat(stats.hp.toFixed(2));
            break
        }
        case "osu!":
        case "osu": {
            if (!(stats.pc_mods & mods.map_changing)) return stats;
            if ((stats.droid_mods & mods.c) | (stats.pc_mods & mods.nc)) speed_mul = 1.5;
            if (stats.cs) {
                if ((stats.droid_mods & mods.r) | (stats.pc_mods & mods.hr)) stats.cs *= 1.3;
                if ((stats.droid_mods & mods.e) | (stats.pc_mods & mods.ez)) stats.cs *= 0.5;
                stats.cs = Math.min(10, stats.cs)
            }
            if (stats.hp) {
                stats.hp *= od_ar_hp_multiplier;
                stats.hp = Math.min(10, stats.hp)
            }
            if (stats.ar) stats.ar = modify_ar(stats.ar, speed_mul, od_ar_hp_multiplier);
            if (stats.od) stats.od = modify_od(stats.od, speed_mul, od_ar_hp_multiplier);

            stats.cs = parseFloat(stats.cs.toFixed(2));
            stats.ar = parseFloat(stats.ar.toFixed(2));
            stats.od = parseFloat(stats.od.toFixed(2));
            stats.hp = parseFloat(stats.hp.toFixed(2));
            break
        }
        default: throw new TypeError("Mode not supported")
    }
    return stats
};

function MapStars() {
    this.droid_stars = 0;
    this.pc_stars = 0
}

// calculates star rating of a map
// ===================================================
// specify osu file in params
MapStars.prototype.calculate = function(params) {
    let osu_file = params.file;
    if (!osu_file) return this;
    let pmod = params.mods;
    if (!pmod) pmod = '';
    let nparser = new droid.parser();
    let pcparser = new osu.parser();
    try {
        nparser.feed(osu_file);
        pcparser.feed(osu_file)
    } catch (e) {
        console.log("Invalid osu file type");
        return this
    }
    let nmap = nparser.map;
    let pcmap = pcparser.map;
    if (nmap.ncircles == 0 && nmap.nsliders == 0) {
        console.log('Error: no object found');
        return this
    }
    let cur_cs = nmap.cs - 4;
    let cur_ar = nmap.ar;
    let cur_od = nmap.od;

    let mod = mods.modbits_from_string(pmod) + 4;
    let pcmods = mod - 4;

    if (pmod.includes("r") || pmod.includes("HR")) {
        mod -= 16;
        cur_ar = Math.min(cur_ar * 1.4, 10);
        cur_od = Math.min(cur_od * 1.4, 10);
        cur_cs++
    }
    if (pmod.includes("e") || pmod.includes("EZ")) {
        mod -= 2;
        cur_ar /= 2;
        cur_od /= 2;
        cur_cs--
    }
    let droidtoMS = 75 + 5 * (5 - cur_od);
    if (pmod.includes("PR")) droidtoMS = 55 + 6 * (5 - cur_od);
    cur_od = 5 - (droidtoMS - 50) / 6;

    nmap.od = cur_od;
    nmap.ar = cur_ar;
    nmap.cs = cur_cs;

    let nstars = new droid.diff().calc({map: nmap, mods: mod});
    let pcstars = new osu.diff().calc({map: pcmap, mods: pcmods});
    this.droid_stars = nstars;
    this.pc_stars = pcstars;
    return this
};

MapStars.prototype.toString = function() {
    return `${this.droid_stars.toString()}\n${this.pc_stars.toString()}`
};

function MapPP() {
    this.pp = 0
}

MapPP.prototype.calculate = function(params) {
    if (!params.acc_percent || params.acc_percent < 0 || params.acc_percent > 100) params.acc_percent = 100;
    params.miss = params.miss ? params.miss : 0;
    if (params.miss < 0) params.miss = 0;
    switch (params.mode) {
        case "osu!droid":
        case "droid": {
            return droid.ppv2({
                stars: params.stars,
                combo: params.combo,
                nmiss: params.miss,
                acc_percent: params.acc_percent
            })
        }
        case "osu!":
        case "osu": {
            return osu.ppv2({
                stars: params.stars,
                combo: params.combo,
                nmiss: params.miss,
                acc_percent: params.acc_percent
            })
        }
        default: throw new TypeError("Mode not supported")
    }
};

// ppv2 calculator
// ========================================
// if stars is not defined, the osu file must
// be defined to calculate map stars on fly
//
// specify mode to switch between
// osu!droid pp and osu! pp
function ppv2(params) {
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
    return new MapPP().calculate(params)
}

// exports
osudroid.PlayerInfo = PlayerInfo;
osudroid.MapInfo = MapInfo;
osudroid.mods = mods;
osudroid.rankImage = rankImage;
osudroid.MapStars = MapStars;
osudroid.MapStats = MapStats;
osudroid.MapPP = MapPP;
osudroid.ppv2 = ppv2

})();
