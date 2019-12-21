let Discord = require('discord.js');
let https = require('https');
let apikey = process.env.OSU_API_KEY;
let droid = require('./ojsamadroid');
let request = require('request');
let config = require('../config.json');
let cd = new Set();

function playInfo (message, obj, i, mod, maxpp, minpp, beatmapentry) {
    if (i >= obj.length) {
        console.log("Done!");
        if (beatmapentry.length == 0) return message.channel.send(`❎ **| ${message.author}, I couldn't find any beatmap recommendations for you! Perhaps adjust your filter, or use one if you're not using it?**`);
        var rolecheck;
        try {
            rolecheck = message.member.highestRole.hexColor
        } catch (e) {
            rolecheck = "#000000"
        }
        let page = 1;
        let pagelimit = Math.ceil(beatmapentry.length / 5);
        let footer = config.avatar_list;
        const index = Math.floor(Math.random() * (footer.length - 1) + 1);
        let embed = editembed(beatmapentry, page, pagelimit, footer, index, rolecheck);

        message.channel.send(`✅ **| ${message.author}, I found ${beatmapentry.length} beatmap recommendations for you! Here they are:**`, {embed: embed}).then(msg => {
            msg.react("⏮️").then(() => {
                msg.react("⬅️").then(() => {
                    msg.react("➡️").then(() => {
                        msg.react("⏭️").catch(e => console.log(e))
                    })
                })
            });

            let backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 180000});
            let back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 180000});
            let next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 180000});
            let forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 180000});

            backward.on('collect', () => {
                if (page === 1) return msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)));
                else page = 1;
                msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)));
                embed = editembed(beatmapentry, page, pagelimit, footer, index, rolecheck);
                msg.edit(`✅ **| ${message.author}, I found ${beatmapentry.length} beatmap recommendations for you! Here they are:**`, {embed: embed}).catch(e => console.log(e))
            });

            back.on('collect', () => {
                if (page === 1) page = pagelimit;
                else page--;
                msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)));
                embed = editembed(beatmapentry, page, pagelimit, footer, index, rolecheck);
                msg.edit(`✅ **| ${message.author}, I found ${beatmapentry.length} beatmap recommendations for you! Here they are:**`, {embed: embed}).catch(e => console.log(e))
            });

            next.on('collect', () => {
                if (page === pagelimit) page = 1;
                else page++;
                msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)));
                embed = editembed(beatmapentry, page, pagelimit, footer, index, rolecheck);
                msg.edit(`✅ **| ${message.author}, I found ${beatmapentry.length} beatmap recommendations for you! Here they are:**`, {embed: embed}).catch(e => console.log(e))
            });

            forward.on('collect', () => {
                if (page === pagelimit) return msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)));
                else page = pagelimit;
                msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)));
                embed = editembed(beatmapentry, page, pagelimit, footer, index, rolecheck);
                msg.edit(`✅ **| ${message.author}, I found ${beatmapentry.length} beatmap recommendations for you! Here they are:**`, {embed: embed}).catch(e => console.log(e))
            })
        });
        return
    }
    console.log(i);
    var mapid = obj[i].beatmap_id;
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

    var parser = new droid.parser();
    var url = "https://osu.ppy.sh/osu/" + mapid;
    request(url, (err, response, data) => {
        parser.feed(data);
        var nmap = parser.map;

        if (nmap.ncircles != 0 && nmap.nsliders != 0) {
            var cur_od = od - 5;
            var cur_ar = ar;
            var cur_cs = cs - 4;

            if (mod.includes("HR")) {
                mods -= 16;
                cur_ar = Math.min(cur_ar * 1.4, 10);
                cur_od = Math.min(cur_od * 1.4, 5);
                cur_cs += 1;
            }

            if (mod.includes("PR")) cur_od += 4;

            nmap.cs = cur_cs; nmap.ar = cur_ar; nmap.od = cur_od;

            var nstars = new droid.diff().calc({map: nmap, mods: mods});

            var npp = new droid.ppv2({
                stars: nstars,
                combo: combo,
                nmiss: 0,
                acc_percent: 100
            });

            parser.reset();

            var pp = npp.toString().split(" ")[0];
            var stars = nstars.toString().split(" ")[0];
            if (isNaN(pp)) pp = 0;
            pp = parseFloat(pp);
            var mapstring = obj[i].artist + " - " + obj[i].title + " (" + obj[i].creator + ") [" + obj[i].version + "] (" + parseFloat(stars).toFixed(2) + "★)";
            var beatmap = {
                beatmapid: mapid,
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
                pp: pp
            };
            if (pp < maxpp + 100 && pp > minpp) beatmapentry.push(beatmap)
        }
        playInfo(message, obj, i+1, mod, maxpp, minpp, beatmapentry)
    })
}

function editembed (beatmapentry, page, pagelimit, footer, index, rolecheck) {
    let embed = new Discord.RichEmbed()
        .setDescription("**Beatmap recommendation (Page " + page + "/" + pagelimit + ")**")
        .setFooter("Alice Synthesis Thirty", footer[index])
        .setColor(rolecheck);

    for (var i = 5 * (page - 1); i < 5 + 5 * (page - 1); i++) {
        if (!beatmapentry[i]) break;
        let mapinfo = `CS: ${beatmapentry[i].cs} - AR: ${beatmapentry[i].ar} - OD: ${beatmapentry[i].od} - HP: ${beatmapentry[i].hp}\nBPM: ${beatmapentry[i].bpm} - Length: ${beatmapentry[i].maplength}/${beatmapentry[i].totallength} - Max Combo: ${beatmapentry[i].combo}x\nLast Update: ${beatmapentry[i].lastupdate} | ${beatmapentry[i].status}\nDroid pp: **${beatmapentry[i].pp} dpp**\n[Beatmap Link](https://osu.ppy.sh/b/${beatmapentry[i].beatmapid}) - Beatmap ID: ${beatmapentry[i].beatmapid}`;
        embed.addField((i+1) + ". " + beatmapentry[i].title, mapinfo)
    }
    return embed
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
    if (cd.has(message.author.id)) return message.channel.send("❎ **| Hey, calm down with the command! I need to rest too, you know.**");
    var mod;
    for (var i = 0; i < args.length; i++) {
        if (args[i].startsWith("+")) mod = args[i]
    }
    let binddb = maindb.collection("userbind");
    let query = {discordid: message.author.id};
    binddb.find(query).toArray((err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (!res[0]) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");

        var pplist;
        var maxpp;
        var minpp;
        if (res[0].pp) pplist = res[0].pp;
        else pplist = [];
        if (pplist[0]) maxpp = parseFloat(pplist[0][2]);
        else maxpp = 0;
        if (pplist[pplist.length - 1]) minpp = parseFloat(pplist[pplist.length - 1][2]);
        else minpp = 0;

        var datelimit = Math.floor(Math.random() * Date.now() / 1000);
        while (datelimit < 1420070400) datelimit = Math.floor(Math.random() * Date.now() / 1000);
        var d = new Date(datelimit * 1000).toISOString().slice(0, 19).replace('T', ' ');

        var options = new URL("https://osu.ppy.sh/api/get_beatmaps?k=" + apikey + "&m=0&since=" + d);
        var content = '';
        var req = https.get(options, res => {
            res.setEncoding("utf8");
            res.on("data", chunk => {
                content += chunk
            });
            res.on("error", err => {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! API. Please try again!**")
            });
            res.on("end", () => {
                var obj;
                try {
                    obj = JSON.parse(content)
                } catch (e) {
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! API. Please try again!**")
                }
                if (!obj[0]) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! API. Please try again!**");
                message.channel.send(`✅ **| ${message.author}, I'm currently fetching beatmap recommendations for you, please wait as this process will take a while!**`);
                var beatmapentry = [];
                let i = 0;
                playInfo(message, obj, i, mod, maxpp, minpp, beatmapentry);
            })
        });
        req.end();
        cd.add(message.author.id);
        setTimeout(() => {
            cd.delete(message.author.id)
        }, 300000)
    })
};

module.exports.help = {
    name: "recommend"
};