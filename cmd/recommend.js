let https = require('https');
let apikey = process.env.OSU_API_KEY;
let droid = require('./ojsamadroid');
let osu = require('ojsama');
let request = require('request');
let cd = new Set();

function beatmapFetch(message, target, i) {
    if (i > 10) return message.channel.send(`❎ **| ${message.author}, I cannot find any beatmap recommendations for you! Perhaps lower your filter, or use it if you're not already?**`);
    var datelimit = Math.floor(Math.random() * Date.now() / 1000);
    while (datelimit < 1388534400) datelimit = Math.floor(Math.random() * Date.now() / 1000);
    var d = new Date(datelimit * 1000).toISOString().slice(0, 19).replace('T', ' ');

    var options = new URL("https://osu.ppy.sh/api/get_beatmaps?k=" + apikey + "&m=0&since=" + d);
    let content = '';

    var req = https.get(options, res => {
        res.setEncoding("utf8");
        res.on("data", chunk => {
            content += chunk
        });
        res.on("error", err => {
            console.log(err);
            console.log("Retrying...");
            return beatmapFetch(message, target)
        });
        res.on("end", () => {
            var obj;
            try {
                obj = JSON.parse(content)
            } catch (e) {}
            if (!obj[0]) {
                console.log("Empty response");
                return beatmapFetch(message, target)
            }
            playInfo(message, obj, 0, target, i)
        })
    });
    req.end()
}

function playInfo(message, obj, i, target, count) {
    var limit = target[0];
    var mod = target[1];
    var maxpp = target[2];
    var minpp = target[3];
    var acc = target[4];
    var beatmapentry = target[5];
    var pplist = target[6];

    if (i >= obj.length || beatmapentry.length == limit) {
        if (beatmapentry.length < limit) {
            console.log(`Beatmap amount not reached. Making a new request... (attempt ${count+1})`);
            return beatmapFetch(message, target, count+1)
        }
        console.log("Done!");
        beatmapentry.sort((a, b) => {
            return b.dpp - a.dpp
        });
        message.author.send(`✅ **| Your request is done! Here are your beatmap recommendation(s):**`);
        return sendMessage(message, beatmapentry, 0)
    }
    console.log(i);
    var maphash = obj[i].file_md5;
    for (var j in pplist) {
        if (maphash == pplist[j][0]) {
            console.log("Duplicate in pp list");
            return playInfo(message, obj, i+1, target, count)
        }
    }
    var mapid = obj[i].beatmap_id;
    var mapsetid = obj[i].beatmapset_id;
    var combo = obj[i].max_combo;
    var cs = obj[i].diff_size;
    var ar = obj[i].diff_approach;
    var od = obj[i].diff_overall;
    var hp = obj[i].diff_drain;
    var bpm = obj[i].bpm;
    var mapduration = time(obj[i].hit_length);
    var totalduration = time(obj[i].total_length);
    var lastdate = obj[i].last_update;

    var mods;
    if (mod) mods = droid.modbits.from_string(mod) + 4;
    else {
        mods = 4;
        mod = ''
    }

    var nparser;
    var pcparser;
    try {
        nparser = new droid.parser();
        pcparser = new osu.parser()
    } catch (e) {
        console.log("Error when attempting to make new parser");
        return setTimeout(() => {
            playInfo(message, obj, i, target, count)
        }, 3000)
    }
    var url = "https://osu.ppy.sh/osu/" + mapid;
    request(url, (err, response, data) => {
        if (err) {
            console.log("Empty response");
            return playInfo(message, obj, i, target, count)
        }
        try {
            nparser.feed(data);
            pcparser.feed(data);
        } catch (e) {
            console.log("Error when attempting to feed data to parser");
            return setTimeout(() => {
                playInfo(message, obj, i, target, count)
            }, 3000)
        }
        var nmap = nparser.map;
        var pcmap = pcparser.map;

        if (nmap.ncircles != 0 && nmap.nsliders != 0) {
            var cur_od = parseFloat(od) - 5;
            var cur_ar = parseFloat(ar);
            var cur_cs = parseFloat(cs) - 4;
            var pcmods = mods - 4;

            if (mod.includes("HR")) {
                mods -= 16;
                cur_ar = Math.min(cur_ar * 1.4, 10);
                cur_od = Math.min(cur_od * 1.4, 5);
                cur_cs += 1;
            }

            if (mod.includes("PR")) cur_od += 4;

            nmap.cs = cur_cs;
            nmap.ar = cur_ar;
            nmap.od = cur_od;

            var nstars = new droid.diff().calc({map: nmap, mods: mods});
            var stars = new osu.diff().calc({map: pcmap, mods: pcmods});

            var npp = new droid.ppv2({
                stars: nstars,
                combo: combo,
                nmiss: 0,
                acc_percent: acc
            });

            var pp = new osu.ppv2({
                stars: stars,
                combo: combo,
                nmiss: 0,
                acc_percent: acc
            });

            nparser.reset();
            pcparser.reset();

            var droidpp = npp.toString().split(" ")[0];
            var pcpp = pp.toString().split(" ")[0];
            var droidstars = nstars.toString().split(" ")[0];
            var pcstars = stars.toString().split(" ")[0];
            if (isNaN(droidpp)) droidpp = 0;
            droidpp = parseFloat(droidpp);
            if (isNaN(pcpp)) pcpp = 0;
            pcpp = parseFloat(pcpp);
            var mapstring = obj[i].artist + " - " + obj[i].title + " (" + obj[i].creator + ") [" + obj[i].version + "] " + mod + " (" + parseFloat(droidstars).toFixed(2) + "★ | " + parseFloat(pcstars).toFixed(2) + "★)";
            var beatmap = {
                beatmapid: mapid,
                setid: mapsetid,
                title: mapstring,
                lastupdate: lastdate,
                status: mapstatus(parseInt(obj[i].approved)),
                cs: cs,
                ar: ar,
                od: od,
                hp: hp,
                bpm: bpm,
                maplength: mapduration,
                totallength: totalduration,
                combo: combo,
                dpp: droidpp,
                pp: pcpp
            };

            if (droidpp < maxpp && droidpp > minpp) {
                var dup = false;
                for (var j = 0; j < beatmapentry.length; j++) {
                    if (beatmapentry[j].beatmapid == mapid) {
                        console.log("Duplicate in map list");
                        dup = true;
                        break
                    }
                    if (beatmapentry[j].setid == mapsetid && beatmapentry[j].dpp < droidpp) {
                        beatmapentry[j] = beatmap;
                        dup = true;
                        console.log(`Entry updated (${beatmapentry.length})`);
                        break
                    }
                }
                if (!dup) {
                    beatmapentry.push(beatmap);
                    console.log(`Entry added (${beatmapentry.length})`)
                }
            }
        } else console.log("Error: No object found");
        playInfo(message, obj, i+1, target, count)
    })
}

function sendMessage(message, beatmapentry, count) {
    var content = '';
    for (var i = count; i < 5 + count; i++) {
        if (!beatmapentry[i]) break;
        let mapinfo = `CS: ${beatmapentry[i].cs} - AR: ${beatmapentry[i].ar} - OD: ${beatmapentry[i].od} - HP: ${beatmapentry[i].hp}\nBPM: ${beatmapentry[i].bpm} - Length: ${beatmapentry[i].maplength}/${beatmapentry[i].totallength} - Max Combo: ${beatmapentry[i].combo}x\nLast Update: ${beatmapentry[i].lastupdate} | ${beatmapentry[i].status}\nDroid pp: **${beatmapentry[i].dpp} dpp**\nPC pp: ${beatmapentry[i].pp} pp\nBeatmap ID: ${beatmapentry[i].beatmapid}`;
        content += `**${i+1}. ${beatmapentry[i].title}**\n${mapinfo}\n\n`
    }
    message.author.send(content);
    if (i % 5 == 0 && i != beatmapentry.length) sendMessage(message, beatmapentry, count+5);
    else {
        setTimeout(() => {
            cd.delete(message.author.id)
        }, 30000)
    }
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

function time(second) {
    return [Math.floor(second / 60), Math.ceil(second - Math.floor(second / 60) * 60).toString().padStart(2, "0")].join(":")
}

module.exports.run = (client, message, args, maindb) => {
    if (message.author.id != '386742340968120321') return message.channel.send("❎ **| I'm sorry, this command is still in testing!**");
    if (cd.has(message.author.id)) return message.channel.send("❎ **| Hey, calm down with the command! I need to rest too, you know.**");
    /*if (message.channel.name != 'bot-ground' && message.channel.id != '635535610739687435') {
        let channel = message.guild.channels.find(c => c.name === 'bot-ground');
        if (channel) return message.channel.send(`❎ **| I'm sorry, this command is only allowed in ${channel}!**`);
        else return message.channel.send("❎ **| Hey, please create #bot-ground first!**")
    }*/
    var limit = parseInt(args[0]);
    if (isNaN(limit)) limit = 10;
    if ((limit < 1 || limit > 20) && limit != 0) return message.channel.send("❎ **| Hey, I only allow a range of 1-20 beatmaps!**");
    if (limit == 0) limit = 10;
    console.log(limit);
    
    let binddb = maindb.collection("userbind");
    let query = {discordid: message.author.id};
    binddb.find(query).toArray((err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (!res[0]) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
        var pplist;
        var mod;
        var maxpp;
        var minpp;
        var acc;
        var manual = false;
        for (var i = 1; i < args.length; i++) {
            if (args[i].startsWith("+")) mod = args[i];
            if (args[i].endsWith("maxdpp")) {
                maxpp = parseFloat(args[i]);
                manual = true
            }
            if (args[i].endsWith("mindpp")) {
                minpp = parseFloat(args[i]);
                manual = true
            }
            if (args[i].endsWith("%")) acc = parseFloat(args[i])
        }
        if (res[0].pp) pplist = res[0].pp;
        else pplist = [];
        if (!manual) {
            if (pplist[0]) maxpp = parseFloat(pplist[0][2]);
            else maxpp = 0;
            if (pplist[pplist.length - 1]) minpp = parseFloat(pplist[pplist.length - 1][2]);
            else minpp = 0
        }
        else if (maxpp - minpp < 50) return message.channel.send("❎ **| I'm sorry, max dpp and min dpp difference must be at least 50!**");
        if (minpp > maxpp) return message.channel.send("❎ **| No, why is the minimum threshold more than maximum threshold?**");
        if (!acc) acc = 100;
        acc = Math.min(100, acc);
        if (acc < 0) return message.channel.send("❎ **| I'm sorry, accuracy cannot be negative!**");

        var modstring;
        if (!mod) modstring = "No Mod";
        else modstring = mod.replace("+", "");

        maxpp = Math.max(0, Math.pow(1.01, maxpp));
        if (maxpp < 500) maxpp += 10;
        minpp = Math.max(0, minpp - Math.pow(0.99, minpp) - 5);

        var dmable = true;
        message.author.send(`✅ **| Hey, I'm fetching beatmap recommendations for you! Please wait as this process takes a while!\n\nYour request statistics:\nBeatmap amount: ${limit}\nMod(s): ${modstring}\nMaximum dpp threshold: ${maxpp.toFixed(2)} dpp\nMinimum dpp threshold: ${minpp.toFixed(2)} dpp**`)
            .catch(() => dmable = false);
        if (!dmable) return message.channel.send(`❎ **| ${message.author}, your DM is locked!`);

        var target = [limit, mod, maxpp, minpp, acc, [], pplist];
        cd.add(message.author.id);
        beatmapFetch(message, target, 1)
    })
};

module.exports.config = {
    description: "Recommend beatmaps based on droid pp threshold.",
    usage: "recommend [limit] [<minimum dpp>mindpp <maximum dpp>maxdpp +<mod>]",
    detail: "`limit`: The amount of beatmaps to search, default is 10 [Integer]\n`minimum dpp`: Minimum droid pp threshold, must be at least 50 less than maximum droid pp threshold. If not specified, uses your bottom play in droid pp data\n`maximum dpp`: Maximum droid pp threshold. If not specified, uses your top play in droid pp data\n`mod`: Applied mods (HD, HR, etc)",
    permission: "None"
};

module.exports.help = {
    name: "recommend"
};
