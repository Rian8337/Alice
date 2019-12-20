let Discord = require('discord.js');
let https = require('https');
let apikey = process.env.OSU_API_KEY;
let droid = require('./ojsamadroid');
let request = require('request');
let config = require('../config.json');

function editembed (beatmaplist, page, pagelimit, footer, index, rolecheck) {
    let embed = new Discord.RichEmbed()
        .setDescription("**Beatmap recommendation (Page " + page + "/" + pagelimit + ")**")
        .setFooter("Alice Synthesis Thirty", footer[index])
        .setColor(rolecheck);

    for (var i = 5 * (page - 1); i < 5 + 5 * (page - 1); i++) {
        if (!beatmaplist[i]) break;
        let mapinfo = `CS: ${beatmaplist[i].cs} - AR: ${beatmaplist[i].ar} - OD: ${beatmaplist[i].od} - HP: ${beatmaplist[i].hp}\nBPM: ${beatmaplist[i].bpm} - Length: ${beatmaplist[i].maplength}/${beatmaplist[i].totallength} - Max Combo: ${beatmaplist[i].combo}x\nLast Update: ${beatmaplist[i].lastupdate} | ${beatmaplist[i].status}\nDroid pp: **${beatmaplist[i].pp} dpp**\n[Beatmap Link](https://osu.ppy.sh/b/${beatmaplist[i].beatmapid}) - Beatmap ID: ${beatmaplist[i].beatmapid}`;
        embed.addField((i+1) + ". " + beatmaplist[i].title, mapinfo)
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

module.exports.run = (client, message, args) => {
    var limit = args[0];
    if (!limit) limit = 10;
    if (isNaN(limit)) return message.channel.send("❎ **| Hey, please enter correct limit!**");
    if (limit < 1 || limit > 100) return message.channel.send("❎ **| Hey, I can only do up to 100 beatmap recommendations!**");

    var options = new URL("https://osu.ppy.sh/api/get_beatmaps?k=" + apikey + "&m=0&limit=" + limit);
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
            var beatmaplist = [];
            var obj;
            try {
                obj = JSON.parse(content)
            } catch (e) {
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! API. Please try again!**")
            }
            if (!obj[0]) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! API. Please try again!**");
            obj = obj.slice(0, limit);
            obj.forEach(map => {
                var mapid = map.beatmap_id;
                var combo = map.max_combo;
                var cs = map.diff_size;
                var ar = map.diff_approach;
                var od = map.diff_overall;
                var hp = map.diff_drain;
                var bpm = map.bpm;
                var mapduration = time(map.hit_length);
                var totalduration = time(map.total_length);
                var parser = new droid.parser();
                var lastdate = map.last_update;
                var url = "https://osu.ppy.sh/osu/" + mapid;
                request(url, (err, response, data) => {
                    parser.feed(data);
                    var mods = 4;
                    var nmap = parser.map;
                    nmap.cs = cs; nmap.ar = ar; nmap.od = od;

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
                    var mapstring = map.artist + " - " + map.title + " (" + map.creator + ") [" + map.version + "] (" + stars + "★)";
                    var beatmap = {
                        beatmapid: mapid,
                        title: mapstring,
                        lastupdate: lastdate,
                        status: mapstatus(parseInt(map.approved)),
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
                    beatmaplist.push(beatmap)
                });
            });
            message.channel.send("✅ **| Fetching beatmaps, please wait...**");

            let timeout = 3000;
            if (limit > 50) timeout = 5000;

            setTimeout(() => {
                var rolecheck;
                try {
                    rolecheck = message.member.highestRole.hexColor
                } catch (e) {
                    rolecheck = "#000000"
                }
                let page = 1;
                let pagelimit = Math.ceil(limit / 5);
                let footer = config.avatar_list;
                const index = Math.floor(Math.random() * (footer.length - 1) + 1);
                let embed = editembed(beatmaplist, page, pagelimit, footer, index, rolecheck);

                message.channel.send({embed: embed}).then(msg => {
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
                        embed = editembed(beatmaplist, page, pagelimit, footer, index, rolecheck);
                        msg.edit({embed: embed}).catch(e => console.log(e))
                    });

                    back.on('collect', () => {
                        if (page === 1) page = pagelimit;
                        else page--;
                        msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)));
                        embed = editembed(beatmaplist, page, pagelimit, footer, index, rolecheck);
                        msg.edit({embed: embed}).catch(e => console.log(e))
                    });

                    next.on('collect', () => {
                        if (page === pagelimit) page = 1;
                        else page++;
                        msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)));
                        embed = editembed(beatmaplist, page, pagelimit, footer, index, rolecheck);
                        msg.edit({embed: embed}).catch(e => console.log(e))
                    });

                    forward.on('collect', () => {
                        if (page === pagelimit) return msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)));
                        else page = pagelimit;
                        msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)));
                        embed = editembed(beatmaplist, page, pagelimit, footer, index, rolecheck);
                        msg.edit({embed: embed}).catch(e => console.log(e))
                    })
                })
            }, timeout)
        })
    });
    req.end()
};

module.exports.help = {
    name: "recommend"
};
