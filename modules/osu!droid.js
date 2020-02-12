// this is a library that I wrote in order to clean some code
// in commands, do note that even though this library is open
// to public, you need an osu!droid API key to access player info

let http = require('http');
let https = require('https');
require('dotenv').config();
let droidapikey = process.env.DROID_API_KEY;
let apikey = process.env.OSU_API_KEY;
let droid = require('./ojsamadroid');
let osu = require('ojsama');
let request = require('request');

let osudroid = {};
if (typeof exports !== 'undefined') osudroid = exports;

(function() {

function PlayerInfo() {
    this.uid = 0;
    this.name = null;
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
        res.setEncoding("utf8");
        res.on("data", chunk => {
            content += chunk
        });
        res.on("end", () => {
            let resarr = content.split("<br>");
            let headerres = resarr[0].split(" ");
            if (headerres[0] == 'FAILED') return callback(this);
            let obj;
            try {
                obj = JSON.parse(resarr[1])
            } catch (e) {
                return callback(this)
            }
            let name = headerres[2];
            let total_score = parseInt(headerres[3]);
            let play_count = parseInt(headerres[4]);
            let rank = obj.rank;
            let recent_plays = obj.recent ? obj.recent : null;
            this.uid = uid;
            this.name = name;
            this.score = total_score;
            this.play_count = play_count;
            this.rank = rank;
            this.recent_plays = recent_plays;
            callback(this)
        })
    });
    req.end()
};

PlayerInfo.prototype.toString = function() {
    return `Username: ${this.name}\nUID: ${this.uid}\nRank: ${this.rank}\nScore: ${this.score}\nPlay count: ${this.play_count}`
};

function MapInfo() {
    this.title = null;
    this.approved = 0;
    this.beatmap_id = 0;
    this.beatmapset_id = 0;
    this.plays = 0;
    this.favorites = 0;
    this.last_update = 0;
    this.hit_length = 0;
    this.total_length = 0;
    this.bpm = 0;
    this.max_combo = 0;
    this.cs = 0;
    this.ar = 0;
    this.od = 0;
    this.hp = 0;
    this.hash = null;
}

// retrieves a map's information, then outputs a callback
MapInfo.prototype.get = function(params, callback) {
    let beatmapid = params.beatmap_id;
    let hash = params.hash;
    if (!beatmapid && !hash) throw new TypeError("Beatmap ID or MD5 hash must be defined");
    let options = new URL(`https://osu.ppy.sh/api/get_beatmaps?k=${apikey}&${beatmapid ? `b=${beatmapid}` : `h=${hash}`}`);
    let content = '';
    let req = https.get(options, res => {
        res.setEncoding("utf8");
        res.on("data", chunk => {
            content += chunk
        });
        res.on("end", () => {
            let obj;
            try {
                obj = JSON.parse(content)
            } catch (e) {
                return callback(this)
            }
            if (!obj[0]) return callback(this);
            let mapinfo = obj[0];
            this.title = `${mapinfo.artist} - ${mapinfo.title} (${mapinfo.creator}) [${mapinfo.version}]`;
            this.approved = parseInt(mapinfo.approved);
            this.beatmap_id = parseInt(mapinfo.beatmap_id);
            this.beatmapset_id = parseInt(mapinfo.beatmapset_id);
            this.plays = parseInt(mapinfo.playcount);
            this.favorites = parseInt(mapinfo.favourite_count);
            this.last_update = mapinfo.last_update;
            this.hit_length = parseInt(mapinfo.hit_length);
            this.total_length = parseInt(mapinfo.total_length);
            this.bpm = parseFloat(mapinfo.bpm);
            this.max_combo = parseInt(mapinfo.max_combo);
            this.cs = parseFloat(mapinfo.diff_size);
            this.ar = parseFloat(mapinfo.diff_approach);
            this.od = parseFloat(mapinfo.diff_overall);
            this.hp = parseFloat(mapinfo.diff_drain);
            this.hash = mapinfo.file_md5;
            callback(this)
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
    return `${this.bpm}${this.bpm == bpm ? "" : ` (${bpm})`}`
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

// show's the map's statistics
// ====================================
// mode 0: return map title and mods used if defined
// mode 1: return CS, AR, OD, HP
// mode 2: return BPM, map length, max combo
// mode 3: return last update date and map status
// mode 4: return favorite count and play count
MapInfo.prototype.showStatistics = function(mods, mode) {
    this.mods = mods ? mods : "";
    this.mode = 'osu';
    let mapstat = new MapStats().calculate(this);
    switch (mode) {
        case 0: return `${this.title}${mods ? ` +${mods}` : ""}`;
        case 1: return `CS: ${this.cs}${this.cs == mapstat.cs ? "": ` (${mapstat.cs})`} - AR: ${this.ar}${this.ar == mapstat.ar ? "": ` (${mapstat.ar})`} - OD: ${this.od}${this.od == mapstat.od ? "": ` (${mapstat.od})`} - HP: ${this.hp}${this.hp == mapstat.hp ? "": ` (${mapstat.hp})`}`;
        case 2: return `BPM: ${this.bpmConvert(this.mods)} - Length: ${this.timeConvert(this.mods)} - Max Combo: ${this.max_combo}x`;
        case 3: return `Last Update: ${this.last_update} | ${this.statusConvert()}`;
        case 4: return `❤️ ${this.favorites} - ▶️ ${this.plays}`;
        default: throw new TypeError("Mode is not supported")
    }
};

// converts droid mod string to PC mod string
MapInfo.prototype.modConvert = function(mods) {
    let modbits = 0;
    for (let i = 0; i < mods.length; i++) {
        switch(mods[i]) {
            case "n": modbits += 1; break;
            case "e": modbits += 2; break;
            case "h": modbits += 8; break;
            case "r": modbits += 16; break;
            case "d": modbits += 64; break;
            case "t": modbits += 256; break;
            case "c": modbits += 512; break;
            default: modbits += 0
        }
    }
    return droid.modbits.string(modbits)
};

MapInfo.prototype.toString = function() {
    return `${this.title}\nCS: ${this.cs} - AR: ${this.ar} - OD: ${this.od} - HP: ${this.hp}
        \nBPM: ${this.bpm} - Length: ${this.hit_length}/${this.total_length} - Max Combo: ${this.max_combo}
        \nLast Update: ${this.last_update}`
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

function MapStats() {
    this.cs = 0;
    this.ar = 0;
    this.od = 0;
    this.hp = 0
}

// calculates map statistics with mods applied
// ===========================================
// specify mode (droid or osu) to switch between
// osu!droid stats and osu! stats
MapStats.prototype.calculate = function(params) {
    let cs = params.cs;
    let ar = params.ar;
    let od = params.od;
    let hp = params.hp;
    if ([cs, ar, od, hp].some(isNaN)) throw new TypeError("CS, AR, OD, and HP must be defined");
    let mods = params.mods ? params.mods : "";
    let speed_mul = 1;
    let od_ar_hp_multiplier = 1;
    if (mods.includes("d") || mods.includes("DT")) speed_mul = 1.5;
    if (mods.includes("t") || mods.includes("HT")) speed_mul *= 0.75;
    if (mods.includes("r") || mods.includes("HR")) od_ar_hp_multiplier = 1.4;
    if (mods.includes("e") || mods.includes("EZ")) od_ar_hp_multiplier *= 0.5;
    switch (params.mode) {
        case "droid": {
            let droidtoMS = 75 + 5 * (5 - od);
            if (mods.includes("PR")) droidtoMS = 55 + 6 * (5 - od);
            od = 5 - (droidtoMS - 50) / 6;
            if (!mods || mods == '-') {
                cs -= 4;
                this.cs = cs;
                this.ar = ar;
                this.od = od;
                this.hp = hp;
                return this
            }
            if (mods.includes("c") || mods.includes("NC")) speed_mul = 1.39;

            if (mods.includes("r") || mods.includes("HR")) cs++;
            if (mods.includes("e") || mods.includes("EZ")) cs--;
            cs -= 4;
            cs = Math.min(10, cs);

            hp *= od_ar_hp_multiplier;
            hp = Math.min(10, hp);

            ar = modify_ar(ar, speed_mul, od_ar_hp_multiplier);

            this.cs = parseFloat(cs.toFixed(2));
            this.ar = parseFloat(ar.toFixed(2));
            this.od = parseFloat(od.toFixed(2));
            this.hp = parseFloat(hp.toFixed(2));
            break
        }
        case "osu": {
            if (!mods || mods == '-') {
                cs -= 4;
                this.cs = cs;
                this.ar = ar;
                this.od = od;
                this.hp = hp;
                return this
            }
            if (mods.includes("c") || mods.includes("NC")) speed_mul = 1.5;
            if (cs) {
                if (mods.includes("r") || mods.includes("HR")) cs *= 1.3;
                if (mods.includes("e") || mods.includes("EZ")) cs *= 0.5;
                cs = Math.min(10, cs)
            }
            if (hp) {
                hp *= od_ar_hp_multiplier;
                hp = Math.min(10, hp)
            }
            if (ar) ar = modify_ar(ar, speed_mul, od_ar_hp_multiplier);
            if (od) od = modify_od(od, speed_mul, od_ar_hp_multiplier);

            this.cs = parseFloat(cs.toFixed(2));
            this.ar = parseFloat(ar.toFixed(2));
            this.od = parseFloat(od.toFixed(2));
            this.hp = parseFloat(hp.toFixed(2));
            break
        }
        default: throw new TypeError("Mode not supported")
    }
    return this
};

function MapStars() {
    this.droid_stars = 0;
    this.pc_stars = 0
}

// calculates star rating of a map, returns a callback
// ===================================================
// beatmap id must be defined to retrieve osu file
//
// specify mode to switch between
// osu!droid star rating and osu! star rating
MapStars.prototype.calculate = function(params, callback) {
    let beatmapid = params.beatmap_id;
    if (!beatmapid) throw new TypeError("Beatmap ID must be defined");
    let pmod = params.mods;
    if (!pmod) pmod = '';
    let nparser = new droid.parser();
    let pcparser = new osu.parser();
    let url = `https://osu.ppy.sh/osu/${beatmapid}`;
    request(url, (err, response, data) => {
        if (err) {
            console.log("Error downloading osu file");
            callback(this)
        }
        nparser.feed(data);
        pcparser.feed(data);
        let nmap = nparser.map;
        let pcmap = pcparser.map;
        if (nmap.ncircles == 0 && nmap.nsliders == 0) {
            console.log('Error: no object found');
            return this
        }
        let cur_cs = nmap.cs - 4;
        let cur_ar = nmap.ar;
        let cur_od = nmap.od;

        let mods = droid.modbits.from_string(pmod) + 4;
        let pcmods = mods - 4;

        if (pmod.includes("r") || pmod.includes("HR")) {
            mods -= 16;
            cur_ar = Math.min(cur_ar * 1.4, 10);
            cur_od = Math.min(cur_od * 1.4, 10);
            cur_cs++
        }
        if (pmod.includes("e") || pmod.includes("EZ")) {
            mods -= 2;
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

        let nstars = new droid.diff().calc({map: nmap, mods: mods});
        let pcstars = new osu.diff().calc({map: pcmap, mods: pcmods});
        this.droid_stars = nstars;
        this.pc_stars = pcstars;
        callback(this)
    })
};

MapStars.prototype.toString = function() {
    return `${this.droid_stars.toString()}\n${this.pc_stars.toString()}`
};

function MapPP() {
    this.pp = 0
}

MapPP.prototype.get = function(params) {
    let pp = '';
    let acc_percent = parseFloat(params.acc_percent);
    if (!acc_percent || acc_percent < 0 || acc_percent > 100) params.acc_percent = 100;
    params.miss = params.miss ? params.miss : 0;
    switch (params.mode) {
        case "droid": {
            pp = droid.ppv2({
                stars: params.stars,
                combo: params.combo,
                nmiss: params.miss,
                acc_percent: params.acc_percent
            });
            break
        }
        case "osu": {
            pp = osu.ppv2({
                stars: params.stars,
                combo: params.combo,
                nmiss: params.miss,
                acc_percent: params.acc_percent
            });
            break
        }
        default: throw new TypeError("Mode not supported")
    }
    return pp
};

// ppv2 calculator
// ========================================
// if stars is not defined, beatmap id must
// be defined to retrieve map
//
// specify mode to switch between
// osu!droid pp and osu! pp if stars is not
// defined
MapPP.prototype.calculate = function(params) {
    if (!params.stars) {
        new MapStars().get(params, star => {
            switch (params.mode) {
                case "droid": params.stars = star.droid_stars; break;
                case "osu": params.stars = star.pc_stars; break;
                default: throw new TypeError("Mode is not supported")
            }
            if (!params.combo) params.combo = params.stars.map.max_combo();
            this.pp = new MapPP().get(params)
        })
    }
    else {
        if (!params.combo) params.combo = params.stars.map.max_combo();
        this.pp = new MapPP().get(params)
    }
    return this
};

// exports
osudroid.PlayerInfo = PlayerInfo;
osudroid.MapInfo = MapInfo;
osudroid.MapStars = MapStars;
osudroid.MapStats = MapStats;
osudroid.MapPP = MapPP

})();
