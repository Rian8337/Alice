let Discord = require('discord.js');
let droid = require('./ojsamadroid');
let https = require('https');
let request = require('request');
let apikey = process.env.OSU_API_KEY;

function retrieveList(res, i, cb) {
    if (!res[i]) return cb([], true);
    let list = [];
    list.push(res[i].uid);
    list.push(res[i].pp);
    cb(list)
}

function recalcPlay(target, i, newtarget, whitelist, cb) {
    if (!target[i]) return cb(false, true);
    let modstring = '';
    if (target[i][1].includes("+")) {
        let mapstring = target[i][1].split("+");
        modstring = mapstring[mapstring.length - 1]
    }
    let guessing_mode = false;
    let isWhitelist = false;
    let whitelistQuery = {hashid: target[i][0]};
    whitelist.findOne(whitelistQuery, (err, wlres) => {
        if (err) {
            console.log("Whitelist find error");
            return cb(true)
        }
        if (wlres) isWhitelist = true;
        let options = '';
        if (isWhitelist) options = new URL(`https://osu.ppy.sh/api/get_beatmaps?k=${apikey}&b=${wlres.mapid}`);
        else options = new URL(`https://osu.ppy.sh/api/get_beatmaps?k=${apikey}&h=${target[i][0]}`);
        let content = '';
        let req = https.get(options, function(res) {
            res.setEncoding("utf8");
            res.on("data", function(chunk) {
                content += chunk
            });
            res.on("end", function() {
                let obj = JSON.parse(content);
                if (!obj[0]) {
                    console.log("Map not found");
                    return cb()
                }
                let mapinfo = obj[0];
                if (mapinfo.mode != 0) return cb();
                let mods = 4 + (modstring ? droid.modbits.from_string(modstring) : 0);
                let acc_percent = 100;
                if (target[i][4]) acc_percent = parseFloat(target[i][4]);
                else guessing_mode = true;
                let combo = parseInt(target[i][3] ? target[i][3] : mapinfo.max_combo);
                let nmiss = target[i][5] ? parseInt(target[i][5]) : 0;
                let parser = new droid.parser();
                let url = `https://osu.ppy.sh/osu/${mapinfo.beatmap_id}`;
                request(url, function(err, response, data) {
                    parser.feed(data);
                    let map = parser.map;
                    let cur_cs = map.cs - 4;
                    let cur_ar = map.ar;
                    let cur_od = map.od - 5;
                    if (modstring.includes("HR")) {
                        mods -= 16;
                        cur_ar = Math.min(10, cur_ar * 1.4);
                        cur_od = Math.min(5, cur_od * 1.4);
                        cur_cs += 1
                    }
                    if (modstring.includes("PR")) cur_od += 4;
                    map.cs = cur_cs;
                    map.ar = cur_ar;
                    map.od = cur_od;
                    if (map.ncircles == 0 && map.nsliders == 0) {
                        console.log(target[i][0] + ' - Error: no object found');
                        console.log(target[i][2] + " -> " + target[i][2]);
                        newtarget.push([target[i][0], target[i][1], target[i][2], target[i][3], target[i][4], target[i][5]]);
                        return cb()
                    }
                    let stars = new droid.diff().calc({map: map, mods: mods});
                    let pp = droid.ppv2({
                        stars: stars,
                        combo: combo,
                        nmiss: nmiss,
                        acc_percent: acc_percent
                    });
                    parser.reset();
                    let newpp = parseFloat(pp.toString().split("(")[0]);
                    let real_pp = guessing_mode ? parseFloat(parseFloat(target[i][2]).toFixed(2)) : newpp;
                    console.log(target[i][2] + " -> " + real_pp);
                    guessing_mode ? newtarget.push([target[i][0], target[i][1], real_pp]) : newtarget.push([target[i][0], target[i][1], real_pp, target[i][3], target[i][4], target[i][5]]);
                    cb()
                })
            })
        });
        req.end()
    })
}

module.exports.run = (client, message, args, maindb) => {
    if (message.channel instanceof Discord.DMChannel || message.member.roles == null) return;
    if (message.author.id != '132783516176875520' && message.author.id != '386742340968120321') return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");
    message.channel.send(`❗**| ${message.author}, are you sure you want to recalculate all players' dpp entry?**`).then(msg => {
        msg.react("✅").catch(console.error);
        let confirmation = false;
        let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 15000});
        confirm.on("collect", () => {
            confirmation = true;
            msg.delete();
            let binddb = maindb.collection("userbind");
            let whitelist = maindb.collection("mapwhitelist");
            binddb.find({}, {projection: {_id: 0, uid: 1, pp: 1, pptotal: 1}}).sort({pptotal: -1}).toArray((err, res) => {
                if (err) throw err;
                let i = 0;
                retrieveList(res, i, function testList(list, stopSign = false) {
                    if (stopSign) return console.log(`✅ **| ${message.author}, recalculation process complete!**`);
                    let uid = list[0];
                    let ppentry = list[1];
                    let newppentry = [];
                    let count = 0;
                    console.log("Uid:", uid);
                    recalcPlay(ppentry, count, newppentry, whitelist, function testPlay(error = false, stopFlag = false) {
                        if (!error) count++;
                        if (count < ppentry.length && !stopFlag) recalcPlay(ppentry, count, newppentry, whitelist, testPlay);
                        else {
                            newppentry.sort((a, b) => {return b[2] - a[2]});
                            let totalpp = 0;
                            let weight = 1;
                            for (let x in newppentry) {
                                totalpp += newppentry[x][2] * weight;
                                weight *= 0.95
                            }
                            let updatedata = {
                                $set: {
                                    pptotal: totalpp,
                                    pp: newppentry
                                }
                            };
                            binddb.updateOne({uid: uid}, updatedata, err => {
                                if (err) return console.log(err);
                                console.log(totalpp);
                                console.log("Done");
                                i++;
                                console.log(`${i}/${res.length} players recalculated`);
                                retrieveList(res, i, testList)
                            })
                        }
                    })
                })
            })
        });
        confirm.on("end", () => {
            if (!confirmation) {
                msg.delete();
                message.channel.send("❎ **| Timed out.**").then(m => m.delete(5000))
            }
        })
    })
};

module.exports.config = {
    description: "Recalculates the entire userbind database.",
    usage: "recalcall",
    detail: "None",
    permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};

module.exports.help = {
    name: "recalcall"
};
