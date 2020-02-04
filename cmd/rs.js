let Discord = require('discord.js');
let http = require('http');
let https = require('https');
let droid = require('./ojsamadroid');
let osu = require('ojsama');
let droidapikey = process.env.DROID_API_KEY;
let apikey = process.env.OSU_API_KEY;
let request = require('request');

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

function getMapPP(hash, mod, combo, acc, miss, cb) {
    let options = new URL(`https://osu.ppy.sh/api/get_beatmaps?k=${apikey}&h=${hash}`);
    let content = '';
    let req = https.get(options, res => {
        res.setEncoding("utf8");
        res.on("data", chunk => {
            content += chunk
        });
        res.on("end", () => {
            let obj;
            try {
                obj = JSON.parse(content);
            } catch (e) {
                return cb()
            }
            if (!obj[0]) return cb();
            let mapinfo = obj[0];
            if (mapinfo.mode != 0) return cb();
            let mods = modenum(mod);
            let acc_percent = parseFloat(acc);
            let nparser = new droid.parser();
            let pcparser = new osu.parser();
            let url = `https://osu.ppy.sh/osu/${mapinfo.beatmap_id}`;
            request(url, (err, response, data) => {
                nparser.feed(data);
                pcparser.feed(data);
                let pcmods = mods - 4;
                let nmap = nparser.map;
                let pcmap = pcparser.map;

                if (nmap.ncircles == 0 && nmap.nsliders == 0) return cb();

                let cur_cs = nmap.cs - 4;
                let cur_ar = nmap.ar;
                let cur_od = nmap.od - 5;

                if (mod.includes("r")) {
                    mods -= 16;
                    cur_ar = Math.min(10, cur_ar * 1.4);
                    cur_od = Math.min(5, cur_od * 1.4);
                    cur_cs++
                }
                if (mod.includes("PR")) cur_od += 4;
                nmap.cs = cur_cs;
                nmap.ar = cur_ar;
                nmap.od = cur_od;

                let nstars = new droid.diff().calc({map: nmap, mods: mods});
                let pcstars = new osu.diff().calc({map: pcmap, mods: pcmods});

                let npp = droid.ppv2({
                    stars: nstars,
                    combo: combo,
                    nmiss: miss,
                    acc_percent: acc_percent
                });

                let pcpp = osu.ppv2({
                    stars: pcstars,
                    combo: combo,
                    nmiss: miss,
                    acc_percent: acc_percent
                });
                let starsline = parseFloat(nstars.toString().split(" ")[0]);
                let pcstarsline = parseFloat(pcstars.toString().split(" ")[0]);
                let ppline = parseFloat(npp.toString().split(" ")[0]);
                let pcppline = parseFloat(pcpp.toString().split(" ")[0]);
                cb(true, mapinfo.beatmapset_id, starsline, pcstarsline, ppline, pcppline)
            })
        })
    });
    req.end()
}

module.exports.run = (client, message, args, maindb) => {
    let ufind = message.author.id;
    if (args[0]) ufind = args[0].replace("<@", "").replace("<@!", "").replace(">", "");
    console.log(ufind);
    let binddb = maindb.collection("userbind");
    let query = {discordid: ufind};
    binddb.find(query).toArray((err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (!res[0]) return message.channel.send("❎ **| I'm sorry, the account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
        let uid = res[0].uid;
        let options = {
            host: "ops.dgsrz.com",
            port: 80,
            path: `/api/getuserinfo.php?apiKey=${droidapikey}&uid=${uid}`
        };
        let content = '';
        let req = http.request(options, function (res) {
            res.setEncoding("utf8");
            res.on("data", function (chunk) {
                content += chunk
            });
            res.on("end", function () {
                let resarr = content.split("<br>");
                let headerres = resarr[0].split(" ");
                if (headerres[0] == "FAILED") return message.channel.send("❎ **| I'm sorry, I cannot find the account!**");
                let name = headerres[2];
                let obj = JSON.parse(resarr[1]);
                let play = obj.recent[0];
                let title = play.filename;
                let score = play.score.toLocaleString();
                let combo = play.combo;
                let rank = rankread(play.mark);
                let ptime = new Date(play.date * 1000);
                ptime.setUTCHours(ptime.getUTCHours() + 7);
                let acc = (play.accuracy / 1000).toFixed(2);
                let miss = play.miss;
                let mod = play.mode;
                let hash = play.hash;
                let embed = new Discord.RichEmbed()
                    .setAuthor(`Recent play for ${name}`, rank)
                    .setTitle(title)
                    .setColor(8311585);

                getMapPP(hash, mod, combo, acc, miss, (available = false, mapset_id, droidsr, pcsr, dpp, pp) => {
                    if (available) embed.setDescription(`**Score**: \`${score}\` - Combo: \`${combo}x\` - Accuracy: \`${acc}%\` (\`${miss}\` x)\nMod: \`${modname(mod)}\`\nTime: \`${ptime.toUTCString()}\`\n\`${droidsr} droid stars - ${pcsr} PC stars\`\n\`${dpp} droid pp - ${pp} PC pp\``).setThumbnail(`https://b.ppy.sh/thumb/${mapset_id}.jpg`);
                    else embed.setDescription(`**Score**: \`${score}\` - Combo: \`${combo}x\` - Accuracy: \`${acc}%\` (\`${miss}\` x)\nMod: \`${modname(mod)}\`\nTime: \`${ptime.toUTCString()}\``);
                    message.channel.send({embed: embed}).catch(console.error)
                })
            })
        });
        req.end()
    })
};

module.exports.config = {
    description: "Retrieves a user's most recent play.",
    usage: "rs [user]",
    detail: "`user`: The user to retrieve [UserResolvable (mention or user ID)]",
    permission: "None"
};

module.exports.help = {
    name: "rs"
};