var Discord = require('discord.js');
var http = require('http');
var https = require('https');
var request = require('request');
var apikey = process.env.OSU_API_KEY;
var droidapikey = process.env.DROID_API_KEY;
var osu = require('ojsama');
var droid = require('./ojsamadroid');

function modname(mod) {
    var res = '';
    var count = 0;
    if (mod.includes("-")) {res += 'None '; count++}
    if (mod.includes("n")) {res += 'NoFail '; count++}
    if (mod.includes("e")) {res += 'Easy '; count++}
    if (mod.includes("t")) {res += 'HalfTime '; count++}
    if (mod.includes("r")) {res += 'HardRock '; count++}
    if (mod.includes("h")) {res += 'Hidden '; count++}
    if (mod.includes("d")) {res += 'DoubleTime '; count++}
    if (mod.includes("c")) {res += 'NightCore '; count++}
    if (count > 1) return res.trimRight().split(" ").join(", ");
    else return res.trimRight()
}

function rankread(imgsrc) {
    let rank="";
    switch(imgsrc) {
        case 'S':rank="http://ops.dgsrz.com/assets/images/ranking-S-small.png";break;
        case 'A':rank="http://ops.dgsrz.com/assets/images/ranking-A-small.png";break;
        case 'B':rank="http://ops.dgsrz.com/assets/images/ranking-B-small.png";break;
        case 'C':rank="http://ops.dgsrz.com/assets/images/ranking-C-small.png";break;
        case 'D':rank="http://ops.dgsrz.com/assets/images/ranking-D-small.png";break;
        case 'SH':rank="http://ops.dgsrz.com/assets/images/ranking-SH-small.png";break;
        case 'X':rank="http://ops.dgsrz.com/assets/images/ranking-X-small.png";break;
        case 'XH':rank="http://ops.dgsrz.com/assets/images/ranking-XH-small.png";break;
        default: rank="unknown"
    }
    return rank
}

function modenum(mod) {
    var res = 4;
    if (mod.includes("r")) res += 16;
    if (mod.includes("h")) res += 8;
    if (mod.includes("d")) res += 64;
    if (mod.includes("c")) res += 576;
    if (mod.includes("n")) res += 1;
    if (mod.includes("e")) res += 2;
    if (mod.includes("t")) res += 256;
    return res
}

function getMapPP(phash, pcombo, pacc, pmissc, pmod = "", cb) {
    var options = new URL("https://osu.ppy.sh/api/get_beatmaps?k=" + apikey + "&h=" + phash);
    var content = '';
    var req = https.request(options, res => {
        res.setEncoding('utf8');
        res.on("data", chunk => {
            content += chunk
        });
        res.on("end", () => {
            var obj;
            try {
                obj = JSON.parse(content)
            } catch (e) {
                return cb(false)
            }
            if (!obj[0]) return cb(false);
            var mapinfo = obj[0];
            var mapid = mapinfo.beatmap_id;
            if (mapinfo.mode != 0) return cb(false);
            var mods = 4;
            var acc_percent = 100;
            var nmiss = 0;
            var combo = mapinfo.max_combo;
            if (pmod) mods = modenum(pmod);
            if (pacc) acc_percent = parseFloat(pacc);
            if (pcombo) combo = parseInt(pcombo);
            if (pmissc) nmiss = parseInt(pmissc);

            var nparser = new droid.parser();
            var pcparser = new osu.parser();
            var url = "https://osu.ppy.sh/osu/" + mapid;
            request(url, (err, response, data) => {
                if (!data) return cb(true, 0, 0);
                nparser.feed(data);
                pcparser.feed(data);
                var pcmods = mods - 4;
                var nmap = nparser.map;
                var pcmap = pcparser.map;
                var cur_od = nmap.od - 5;
                var cur_ar = nmap.ar;
                var cur_cs = nmap.cs - 4;
                if (pmod.includes("r")) {
                    mods -= 16;
                    cur_ar = Math.min(cur_ar*1.4, 10);
                    cur_od = Math.min(cur_od*1.4, 5);
                    cur_cs += 1;
                }
                nmap.od = cur_od;
                nmap.ar = cur_ar;
                nmap.cs = cur_cs;

                if (nmap.ncircles == 0 && nmap.nsliders == 0) return cb(true, 0, 0);

                var nstars = new droid.diff().calc({map: nmap, mods: mods});
                var pcstars = new osu.diff().calc({map: pcmap, mods: pcmods});

                var npp = new droid.ppv2({
                    stars: nstars,
                    combo: combo,
                    nmiss: nmiss,
                    acc_percent: acc_percent
                });

                var pcpp = new osu.ppv2({
                    stars: pcstars,
                    combo: combo,
                    nmiss: nmiss,
                    acc_percent: acc_percent
                });
                var ppline = parseFloat(npp.toString().split(" ")[0]);
                var pcppline = parseFloat(pcpp.toString().split(" ")[0]);
                cb(true, ppline, pcppline)
            })
        })
    });
    req.end()
}

module.exports.run = (client, message = "", args = {}, maindb) => {
    let curtime = Math.floor(Date.now() / 1000);
    let trackdb = maindb.collection("tracking");
    trackdb.find({}).toArray(function(err, res) {
        if (err) throw err;
        res.forEach(function(player) {
            var options = {
                host: "ops.dgsrz.com",
                port: 80,
                path: "/api/getuserinfo.php?apiKey=" + droidapikey + "&uid=" + player.uid
            };
            var content = '';

            var req = http.request(options, function(res) {
                res.setEncoding("utf8");
                res.on("data", function(chunk) {
                    content += chunk
                });
                res.on("end", function() {
                    var resarr = content.split("<br>");
                    var headerres = resarr[0].split(" ");
                    var name = headerres[2];
                    var obj;
                    try {
                        obj = JSON.parse(resarr[1])
                    } catch (e) {
                        return
                    }
                    var play = obj.recent;
                    for (var i = 0; i < play.length; i++) {
                        let timeDiff = curtime - (play[i].date + 3600 * 7); //server time is UTC-7, while curtime is in UTC
                        if (timeDiff > 600) break;
                        let title = play[i].filename;
                        let score = play[i].score.toLocaleString();
                        let ptime = new Date(play[i].date * 1000);
                        ptime.setUTCHours(ptime.getUTCHours() + 7);
                        let acc = (play[i].accuracy / 1000).toFixed(2);
                        let mod = play[i].mode;
                        let miss = play[i].miss;
                        let rank = rankread(play[i].mark);
                        let combo = play[i].combo;
                        let hash = play[i].hash;
                        getMapPP(hash, combo, acc, miss, mod, (available, dpp, pp) => {
                            let embed = new Discord.RichEmbed()
                                .setAuthor(`Recent play for ${name}`, rank)
                                .setTitle(title)
                                .setColor(8311585);

                            if (available) embed.setDescription(`**Score**: \`${score}\` - Combo: \`${combo}x\` - Accuracy: \`${acc}%\` (\`${miss}\` x)\nMod: \`${modname(mod)}\`\nTime: \`${ptime.toUTCString()}\`\n\`${dpp} dpp - ${pp} PC pp\``);
                            else embed.setDescription(`**Score**: \`${score}\` - Combo: \`${combo}x\` - Accuracy: \`${acc}%\` (\`${miss}\` x)\nMod: \`${modname(mod)}\`\nTime: \`${ptime.toUTCString()}\``);

                            client.channels.get("664880705372684318").send({embed: embed});
                            client.channels.get("665106609382359041").send({embed: embed})
                        })
                    }
                })
            });
            req.end()
        })
    })
};

module.exports.config = {
    description: "Function for tracking recent plays.",
    usage: "None",
    detail: "None",
    permission: "None"
};

module.exports.help = {
    name: "trackfunc"
};
