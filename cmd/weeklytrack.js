let Discord = require('discord.js');
let https = require('https');
let droid = require('./ojsamadroid');
let osu = require('ojsama');
let request = require('request');
let apikey = process.env.OSU_API_KEY;
let config = require('../config.json');

class MapStats {
    constructor() {
        this.title = '';
        this.approved = 0;
        this.beatmap_id = 0;
        this.beatmapset_id = 0;
        this.plays = 0;
        this.favorites = 0;
        this.last_update = 0;
        this.hit_length = 0;
        this.map_length = 0;
        this.bpm = 0;
        this.max_combo = 0;
        this.cs = 0;
        this.ar = 0;
        this.od = 0;
        this.hp = 0;
        this.droid_stars = 0;
        this.pc_stars = 0
    }
    stat_calc(params) {
        let cs = parseFloat(params.cs);
        let ar = parseFloat(params.ar);
        let od = parseFloat(params.od);
        let hp = parseFloat(params.hp);
        let mods = params.mods.toUpperCase();
        let speed_mul = 1;
        if (mods.includes("DT")) speed_mul = 1.5;
        if (mods.includes("NC")) speed_mul = 1.39;
        if (mods.includes("HT")) speed_mul *= 0.75;

        let od_ar_hp_multiplier = 1;
        if (mods.includes("HR")) od_ar_hp_multiplier = 1.4;
        if (mods.includes("EZ")) od_ar_hp_multiplier *= 0.5;
        if (cs) {
            if (mods.includes("HR")) cs *= 1.3;
            if (mods.includes("EZ")) cs *= 0.5;
            cs = Math.min(10, cs)
        }
        if (hp) {
            hp *= od_ar_hp_multiplier;
            hp = Math.min(10, hp)
        }
        if (ar) ar = this.modify_ar(ar, speed_mul, od_ar_hp_multiplier);
        if (od) od = this.modify_od(od, speed_mul, od_ar_hp_multiplier);

        this.cs = parseFloat(cs.toFixed(2));
        this.ar = parseFloat(ar.toFixed(2));
        this.od = parseFloat(od.toFixed(2));
        this.hp = parseFloat(hp.toFixed(2));
        return this
    }
    modify_ar(base_ar, speed_mul, multiplier) {
        let AR0_MS = 1800.0;
        let AR5_MS = 1200.0;
        let AR10_MS = 450.0;
        let AR_MS_STEP1 = (AR0_MS - AR5_MS) / 5.0;
        let AR_MS_STEP2 = (AR5_MS - AR10_MS) / 5.0;
        let ar = base_ar * multiplier;
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
    modify_od(base_od, speed_mul, multiplier) {
        let OD0_MS = 80;
        let OD10_MS = 20;
        let OD_MS_STEP = (OD0_MS - OD10_MS) / 10.0;
        let od = base_od * multiplier;
        let odms = OD0_MS - Math.ceil(OD_MS_STEP * od);
        odms = Math.min(OD0_MS, Math.max(OD10_MS, odms));
        odms /= speed_mul;
        od = (OD0_MS - odms) / OD_MS_STEP;
        return od
    }
    retrieve(params, cb) {
        let message = params.message;
        let beatmapid = params.beatmap_id;
        let mod = params.mod;
        let options = new URL(`https://osu.ppy.sh/api/get_beatmaps?k=${apikey}&b=${beatmapid}`);
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
                    return message.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! API. Please try again!**")
                }
                let mapinfo = obj[0];
                if (mapinfo.mode != 0) return;
                let mods = modenum(mod);
                let bpm = parseFloat(mapinfo.bpm);
                let title = `${mapinfo.artist} - ${mapinfo.title} (${mapinfo.creator}) [${mapinfo.version}]`;
                let nparser = new droid.parser();
                let pcparser = new osu.parser();
                let url = `https://osu.ppy.sh/osu/${beatmapid}`;
                request(url, (err, response, data) => {
                    if (err) return message.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! API. Please try again!**");
                    nparser.feed(data);
                    pcparser.feed(data);
                    let pcmods = mods - 4;
                    let nmap = nparser.map;
                    let pcmap = pcparser.map;

                    if (nmap.ncircles == 0 && nmap.nsliders == 0) return message.send("❎ **| I'm sorry, the map doesn't have any objects!**");

                    let cur_cs = nmap.cs - 4;
                    let cur_ar = nmap.ar;
                    let cur_od = nmap.od - 5;

                    if (mod.includes("HR")) {
                        mods -= 16;
                        cur_ar = Math.min(10, cur_ar * 1.4);
                        cur_od = Math.min(5, cur_od * 1.4);
                        cur_cs++
                    }
                    if (mod.includes("PR")) cur_od += 4;
                    nmap.cs = cur_cs;
                    nmap.ar = cur_ar;
                    nmap.od = cur_od;

                    let hitlength = mapinfo.hit_length;
                    let maplength = mapinfo.total_length;
                    if (mod.toUpperCase().includes("DT")) {
                        hitlength = Math.ceil(hitlength / 1.5);
                        maplength = Math.ceil(maplength / 1.5);
                        bpm *= 1.5
                    }
                    if (mod.toUpperCase().includes("NC")) {
                        hitlength = Math.ceil(hitlength / 1.39);
                        maplength = Math.ceil(maplength / 1.39);
                        bpm *= 1.39
                    }
                    if (mod.toUpperCase().includes("HT")) {
                        hitlength = Math.ceil(hitlength * 4/3);
                        maplength = Math.ceil(hitlength * 4/3);
                        bpm *= 0.75
                    }

                    let nstars = new droid.diff().calc({map: nmap, mods: mods});
                    let pcstars = new osu.diff().calc({map: pcmap, mods: pcmods});

                    let starsline = parseFloat(nstars.toString().split(" ")[0]);
                    let pcstarsline = parseFloat(pcstars.toString().split(" ")[0]);
                    let mapstat = this.stat_calc({cs: mapinfo.diff_size, ar: mapinfo.diff_approach, od: mapinfo.diff_overall, hp: mapinfo.diff_drain, mods: mod});

                    mapstat.cs = mapinfo.diff_size == mapstat.cs ? mapstat.cs : `${mapinfo.diff_size} (${mapstat.cs})`;
                    mapstat.ar = mapinfo.diff_approach == mapstat.ar ? mapstat.ar : `${mapinfo.diff_approach} (${mapstat.ar})`;
                    mapstat.od = mapinfo.diff_overall == mapstat.od ? mapstat.od : `${mapinfo.diff_overall} (${mapstat.od})`;
                    mapstat.hp = mapinfo.diff_drain == mapstat.hp ? mapstat.hp : `${mapinfo.diff_drain} (${mapstat.hp})`;

                    bpm = mapinfo.bpm == bpm? bpm : `${mapinfo.bpm} (${bpm.toFixed(2)})`;
                    hitlength = mapinfo.hit_length == hitlength ? time(hitlength) : `${time(mapinfo.hit_length)} (${time(hitlength)})`;
                    maplength = mapinfo.total_length == maplength ? time(maplength) : `${time(mapinfo.total_length)} (${time(maplength)})`;

                    // callback
                    this.title = title;
                    this.approved = parseInt(mapinfo.approved);
                    this.beatmap_id = beatmapid;
                    this.beatmapset_id = parseInt(mapinfo.beatmapset_id);
                    this.plays = parseInt(mapinfo.playcount);
                    this.favorites = parseInt(mapinfo.favourite_count);
                    this.last_update = mapinfo.last_update;
                    this.hit_length = hitlength;
                    this.map_length = maplength;
                    this.bpm = bpm;
                    this.max_combo = parseInt(mapinfo.max_combo);
                    this.cs = mapstat.cs;
                    this.ar = mapstat.ar;
                    this.od = mapstat.od;
                    this.hp = mapstat.hp;
                    this.droid_stars = starsline;
                    this.pc_stars = pcstarsline;
                    cb(this)
                })
            })
        });
        req.end()
    }
}

function modenum(mod) {
    var res = 4;
    if (mod.includes("n") || mod.includes("NF")) res += 1;
    if (mod.includes("e") || mod.includes("EZ")) res += 2;
    if (mod.includes("t") || mod.includes("HT")) res += 256;
    if (mod.includes("h") || mod.includes("HD")) res += 8;
    if (mod.includes("d") || mod.includes("DT")) res += 64;
    if (mod.includes("c") || mod.includes("NC")) res += 576;
    if (mod.includes("r") || mod.includes("HR")) res += 16;
    return res
}

function mapstatus(status) {
	switch (status) {
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

function mapstatusread(status) {
	switch (status) {
		case -2: return 16711711;
		case -1: return 9442302;
		case 0: return 16312092;
		case 1: return 2483712;
		case 2: return 16741376;
		case 3: return 5301186;
		case 4: return 16711796;
		default: return 0
	}
}

function time(second) {
	return [Math.floor(second / 60), Math.ceil(second - Math.floor(second / 60) * 60).toString().padStart(2, "0")].join(":")
}

function timeconvert(num) {
    let sec = parseInt(num);
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - hours * 3600) / 60);
    let seconds = sec - hours * 3600 - minutes * 60;
    return [hours, minutes.toString().padStart(2, "0"), seconds.toString().padStart(2, "0")].join(":")
}

module.exports.run = (client, message = "", args = {}, maindb, alicedb) => {
    let dailydb = alicedb.collection("dailychallenge");
    let query = {status: "w-ongoing"};
    dailydb.find(query).toArray((err, dailyres) => {
        if (err) return console.log("Cannot access database");
        if (!dailyres[0]) return client.fetchUser("386742340968120321").then(user => user.send("Hey, I need you to start a weekly challenge now!")).catch(console.error);
        let timelimit = dailyres[0].timelimit;
        if (Math.floor(Date.now() / 1000) - timelimit < 0) return;
        let pass = dailyres[0].pass;
        let bonus = dailyres[0].bonus;
        let challengeid = dailyres[0].challengeid;
        let constrain = dailyres[0].constrain.toUpperCase();
        let beatmapid = dailyres[0].beatmapid;
        new MapStats().retrieve({message: client.channels.get("669221772083724318"), beatmap_id: beatmapid, mod: constrain}, mapstat => {
            let pass_string = '';
            let bonus_string = '';
            switch (pass[0]) {
                case "score": {
                    pass_string = `Score V1 above **${pass[1].toLocaleString()}**`;
                    break
                }
                case "acc": {
                    pass_string = `Accuracy above **${pass[1]}%**`;
                    break
                }
                case "scorev2": {
                    pass_string = `Score V2 above **${pass[1].toLocaleString()}**`;
                    break
                }
                case "miss": {
                    pass_string = pass[1] == 0?"No misses":`Miss count below **${pass[1]}**`;
                    break
                }
                case "combo": {
                    pass_string = `Combo above **${pass[1]}**`;
                    break
                }
                case "rank": {
                    pass_string = `**${pass[1].toUpperCase()}** rank or above`;
                    break
                }
                default: pass_string = 'No pass condition'
            }
            switch (bonus[0]) {
                case "score": {
                    bonus_string += `Score V1 above **${bonus[1].toLocaleString()}** (__${bonus[2]}__ ${bonus[2] == 1?"point":"points"})`;
                    break
                }
                case "acc": {
                    bonus_string += `Accuracy above **${parseFloat(bonus[1]).toFixed(2)}%** (__${bonus[2]}__ ${bonus[2] == 1?"point":"points"})`;
                    break
                }
                case "scorev2": {
                    bonus_string += `Score V2 above **${bonus[1].toLocaleString()}** (__${bonus[3]}__ ${bonus[3] == 1?"point":"points"})`;
                    break
                }
                case "miss": {
                    bonus_string += `${bonus[1] == 0?"No misses":`Miss count below **${bonus[1]}**`} (__${bonus[2]}__ ${bonus[2] == 1?"point":"points"})`;
                    break
                }
                case "mod": {
                    bonus_string += `Usage of **${bonus[1].toUpperCase()}** mod (__${bonus[2]}__ ${bonus[2] == 1?"point":"points"})`;
                    break
                }
                case "combo": {
                    bonus_string += `Combo above **${bonus[1]}** (__${bonus[2]}__ ${bonus[2] == 1?"point":"points"})`;
                    break
                }
                case "rank": {
                    bonus_string += `**${bonus[1].toUpperCase()}** rank or above (__${bonus[2]}__ ${bonus[2] == 1?"point":"points"})`;
                    break
                }
                default: bonus_string += "No bonuses available"
            }
            let constrain_string = constrain == ''?"Any mod is allowed":`**${constrain}** only`;
            let footer = config.avatar_list;
            const index = Math.floor(Math.random() * (footer.length - 1) + 1);

            let embed = new Discord.RichEmbed()
                .setAuthor(challengeid.includes("w")?"osu!droid Weekly Bounty Challenge":"osu!droid Daily Challenge", "https://image.frl/p/beyefgeq5m7tobjg.jpg")
                .setColor(mapstatusread(mapstat.approved))
                .setFooter(`Alice Synthesis Thirty | Challenge ID: ${challengeid} | Time left: ${timeconvert(timelimit)}`, footer[index])
                .setThumbnail(`https://b.ppy.sh/thumb/${mapstat.beatmapset_id}.jpg`)
                .setDescription(`**[${mapstat.title}](https://osu.ppy.sh/b/${beatmapid})**\nDownload: [Google Drive](${dailyres[0].link[0]}) - [OneDrive](${dailyres[0].link[1]})`)
                .addField("Map Info", `CS: ${mapstat.cs} - AR: ${mapstat.ar} - OD: ${mapstat.od} - HP: ${mapstat.hp}\nBPM: ${mapstat.bpm} - Length: ${mapstat.hit_length}/${mapstat.map_length} - Max Combo: ${mapstat.max_combo}x\nLast Update: ${mapstat.last_update} | ${mapstatus(mapstat.approved)}\n❤️ ${mapstat.favorites} - ▶️ ${mapstat.plays}`)
                .addField(`Star Rating:\n${"★".repeat(Math.min(10, parseInt(mapstat.droid_stars)))} ${parseFloat(mapstat.droid_stars).toFixed(2)} droid stars\n${"★".repeat(Math.min(10, parseInt(mapstat.pc_stars)))} ${parseFloat(mapstat.pc_stars).toFixed(2)} PC stars`, `**${dailyres[0].points == 1?"Point":"Points"}**: ${dailyres[0].points} ${dailyres[0].points == 1?"point":"points"}\n**Pass Condition**: ${pass_string}\n**Constrain**: ${constrain_string}\n\n**Bonus**\n${bonus_string}`);

            client.channels.get("669221772083724318").send("✅ **| Weekly challenge ended!**", {embed: embed});

            let updateVal = {
                $set: {
                    status: "finished"
                }
            };
            dailydb.updateOne(query, updateVal, err => {
                if (err) return console.log("Cannot update challenge status");
                console.log("Challenge status updated")
            });
            let nextchallenge = "w" + (parseInt(dailyres[0].challengeid.match(/(\d+)$/)[0]) + 1);
            client.commands.get("dailyautostart").run(client, message, [nextchallenge], maindb, alicedb);
        })
    })
};

module.exports.config = {
	description: "Used to track weekly challenge time limit.",
	usage: "None",
	detail: "None",
	permission: "None"
};

module.exports.help = {
	name: "weeklytrack"
};
