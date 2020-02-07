let Discord = require('discord.js');
let https = require('https');
require('dotenv').config();
let apikey = process.env.OSU_API_KEY;
let config = require('../config.json');

class MapStats {
    constructor() {
        this.cs = 0;
        this.ar = 0;
        this.od = 0;
        this.hp = 0
    }
    calc(params) {
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
        var arms = (
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
}

function time(second) {
    return [Math.floor(second / 60), Math.ceil(second - Math.floor(second / 60) * 60).toString().padStart(2, "0")].join(":")
}

function timeconvert (num) {
    let sec = parseInt(num);
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - hours * 3600) / 60);
    let seconds = sec - hours * 3600 - minutes * 60;
    return [hours, minutes.toString().padStart(2, "0"), seconds.toString().padStart(2, "0")].join(":")
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

module.exports.run = (client, message, args, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel || message.author != null) return;
    let channel = client.channels.get("546135349533868072");
    let challengeid = args[0];
    if (!challengeid) return channel.send("❎ **| Hey, I don't know which challenge to start!**");

    let dailydb = alicedb.collection("dailychallenge");
    let query = {challengeid: challengeid};
    dailydb.find(query).toArray((err, dailyres) => {
        if (err) {
            console.log(err);
            return channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (!dailyres[0]) return channel.send("❎ **| I'm sorry, I cannot find the challenge!**");
        let pass = dailyres[0].pass;
        let bonus = dailyres[0].bonus;
        let constrain = dailyres[0].constrain.toUpperCase();
        let timelimit = Math.floor(Date.now() / 1000) + (dailyres[0].challengeid.includes("w")?86400 * 7:86400);
        let beatmapid = dailyres[0].beatmapid;
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
                    return channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! API. Please try again!**")
                }
                if (!obj[0]) return channel.send("❎ **| I'm sorry, I cannot find the map!");
                let mapinfo = obj[0];
                let title = `${mapinfo.artist} - ${mapinfo.title} (${mapinfo.creator}) [${mapinfo.version}]`;
                let hitlength = mapinfo.hit_length;
                let maplength = mapinfo.total_length;
                let bpm = mapinfo.bpm;

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
                if (challengeid.includes("w")) {
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
                }
                else {
                    let difflist = ["Easy", "Normal", "Hard"];
                    for (let i = 0; i < bonus.length; i++) {
                        bonus_string += `${difflist[i]}: `;
                        switch (bonus[i][0]) {
                            case "score": {
                                bonus_string += `Score V1 above **${bonus[i][1].toLocaleString()}** (__${bonus[i][2]}__ ${bonus[i][2] == 1 ? "point" : "points"})`;
                                break
                            }
                            case "acc": {
                                bonus_string += `Accuracy above **${parseFloat(bonus[i][1]).toFixed(2)}%** (__${bonus[i][2]}__ ${bonus[i][2] == 1 ? "point" : "points"})`;
                                break
                            }
                            case "scorev2": {
                                bonus_string += `Score V2 above **${bonus[i][1].toLocaleString()}** (__${bonus[i][3]}__ ${bonus[i][3] == 1 ? "point" : "points"})`;
                                break
                            }
                            case "miss": {
                                bonus_string += `${bonus[i][1] == 0 ? "No misses" : `Miss count below **${bonus[i][1]}**`} (__${bonus[i][2]}__ ${bonus[i][2] == 1 ? "point" : "points"})`;
                                break
                            }
                            case "mod": {
                                bonus_string += `Usage of **${bonus[i][1].toUpperCase()}** mod (__${bonus[i][2]}__ ${bonus[i][2] == 1 ? "point" : "points"})`;
                                break
                            }
                            case "combo": {
                                bonus_string += `Combo above **${bonus[i][1]}** (__${bonus[i][2]}__ ${bonus[i][2] == 1 ? "point" : "points"})`;
                                break
                            }
                            case "rank": {
                                bonus_string += `**${bonus[i][1].toUpperCase()}** rank or above (__${bonus[i][2]}__ ${bonus[i][2] == 1 ? "point" : "points"})`;
                                break
                            }
                            default:
                                bonus_string += "No bonuses available"
                        }
                        bonus_string += '\n'
                    }
                }
                let constrain_string = constrain == ''?"Any rankable mod is allowed":`**${constrain}** only`;
                let mapstat = new MapStats().calc({cs: mapinfo.diff_size, ar: mapinfo.diff_approach, od: mapinfo.diff_overall, hp: mapinfo.diff_drain, mods: constrain});
                if (constrain.includes("DT")) {
                    hitlength = Math.ceil(hitlength / 1.5);
                    maplength = Math.ceil(maplength / 1.5);
                    bpm *= 1.5
                }
                if (constrain.includes("NC")) {
                    hitlength = Math.ceil(hitlength / 1.39);
                    maplength = Math.ceil(maplength / 1.39);
                    bpm *= 1.39
                }
                if (constrain.includes("HT")) {
                    hitlength = Math.ceil(hitlength * 4/3);
                    maplength = Math.ceil(hitlength * 4/3);
                    bpm *= 0.75
                }

                let footer = config.avatar_list;
                const index = Math.floor(Math.random() * (footer.length - 1) + 1);
                let embed = new Discord.RichEmbed()
                    .setAuthor(challengeid.includes("w")?"osu!droid Weekly Bounty Challenge":"osu!droid Daily Challenge", "https://image.frl/p/beyefgeq5m7tobjg.jpg")
                    .setColor(mapstatusread(parseInt(mapinfo.approved)))
                    .setFooter(`Alice Synthesis Thirty | Challenge ID: ${challengeid} | Time left: ${timeconvert(timelimit - Math.floor(Date.now() / 1000))}`, footer[index])
                    .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}.jpg`)
                    .setDescription(`**[${title}](https://osu.ppy.sh/b/${beatmapid})**\nDownload: [Google Drive](${dailyres[0].link[0]}) - [OneDrive](${dailyres[0].link[1]})`)
                    .addField(`Map Info`, `CS: ${mapinfo.diff_size}${mapstat.cs == mapinfo.diff_size?"":` (${mapstat.cs})`} - AR: ${mapinfo.diff_approach}${mapstat.ar == mapinfo.diff_approach?"":` (${mapstat.ar})`} - OD: ${mapinfo.diff_overall}${mapstat.od == mapinfo.diff_overall?"":` (${mapstat.od})`} - HP: ${mapinfo.diff_drain}${mapstat.hp == mapinfo.diff_drain?"":` (${mapstat.hp})`}\nBPM: ${mapinfo.bpm}${mapinfo.bpm == bpm?"":` (${bpm.toFixed(2)})`} - Length: ${time(mapinfo.hit_length)}${hitlength == mapinfo.hit_length?"":` (${time(hitlength)})`}/${time(mapinfo.total_length)}${maplength == mapinfo.total_length?"":` (${time(maplength)})`} - Max Combo: ${mapinfo.max_combo}x\nLast Update: ${mapinfo.last_update} | ${mapstatus(parseInt(mapinfo.approved))}\n❤️ ${mapinfo.favourite_count} - ▶️ ${mapinfo.playcount}`)
                    .addField(`Star Rating: ${"★".repeat(Math.min(10, parseInt(mapinfo.difficultyrating)))} ${parseFloat(mapinfo.difficultyrating).toFixed(2)}`, `**${dailyres[0].points == 1?"Point":"Points"}**: ${dailyres[0].points} ${dailyres[0].points == 1?"point":"points"}\n**Pass Condition**: ${pass_string}\n**Constrain**: ${constrain_string}\n\n**Bonus**\n${bonus_string}`);

                client.channels.get("546135349533868072").send(`✅ **| Successfully started challenge \`${challengeid}\`.\n<@&674918022116278282>**`, {embed: embed});

                let updateVal;
                if (challengeid.includes("w")) updateVal = {
                    $set: {
                        status: "w-ongoing",
                        timelimit: timelimit
                    }
                };
                else updateVal = {
                    $set: {
                        status: "ongoing",
                        timelimit: timelimit
                    }
                };
                dailydb.updateOne(query, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    console.log("Challenge started")
                })
            })
        });
        req.end()
    })
};

module.exports.config = {
    description: "Used to automatically start a challenge.",
    usage: "None",
    detail: "None",
    permission: "None"
};

module.exports.help = {
    name: "dailyautostart"
};
