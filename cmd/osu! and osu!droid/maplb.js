const Discord = require('discord.js');
const request = require('request');
const apikey = process.env.DROID_API_KEY;
const config = require('../../config.json');
const osudroid = require('osu-droid');
const cd = new Set();

function fetchScores(hash, page) {
    return new Promise(resolve => {
        let url = `http://ops.dgsrz.com/api/scoresearchv2.php?apiKey=${apikey}&hash=${hash}&page=${page}&order=score`;
        request(url, (err, response, data) => {
            if (err || !data) {
                console.log("Empty response from droid API");
                page--;
                resolve(null)
            }
            let entries = [];
            let line = data.split('<br>');
            line.shift();
            for (let i in line) entries.push(line[i]);
            if (!line[0]) resolve(null);
            else resolve(entries)
        })
    })
}

function rankEmote(input) {
    switch (input) {
        case 'A':
            return '611559473236148265';
        case 'B':
            return '611559473169039413';
        case 'C':
            return '611559473328422942';
        case 'D':
            return '611559473122639884';
        case 'S':
            return '611559473294606336';
        case 'X':
            return '611559473492000769';
        case 'SH':
            return '611559473361846274';
        case 'XH':
            return '611559473479155713';
        default :
            return
    }
}

async function editEmbed(client, hash, cache, rolecheck, page, mapinfo, top_entry, footer, index, global_star) {
    return new Promise(async resolve => {
        let page_limit = Math.floor((page - 1) / 20);
        let entries = null;
        for (let i = 0; i < cache.length; i++) {
            if (page_limit != cache[i].page) continue;
            entries = cache[i].scores;
            break
        }
        if (!entries) {
            let scores = await fetchScores(hash, page_limit);
            entries = scores;
            cache.push({page: page_limit, scores: scores})
        }
        if (!Array.isArray(entries)) resolve(null);

        let droid_stars = parseFloat(global_star.droid_stars.total.toFixed(2));
        let pc_stars = parseFloat(global_star.pc_stars.total.toFixed(2));
        let embed = new Discord.MessageEmbed()
            .setAuthor("Map Found", "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg")
            .setFooter(`Alice Synthesis Thirty | Page ${page}`, footer[index])
            .setColor(rolecheck)
            .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}.jpg`)
            .setTitle(`${mapinfo.full_title} (${droid_stars}★ | ${pc_stars}★)`)
            .setURL(`https://osu.ppy.sh/b/${mapinfo.beatmap_id}`)
            .setDescription(`${mapinfo.showStatistics("", 1)}\n\n${mapinfo.showStatistics("", 2)}\n${mapinfo.showStatistics("", 3)}\n${mapinfo.showStatistics("", 4)}\n${mapinfo.showStatistics("", 5)}`)
            .addField("**Top Score**", `${client.emojis.cache.get(top_entry.rank)} **${top_entry.name}${top_entry.mod ? ` (+${top_entry.mod})` : ""}\nScore**: \`${top_entry.score}\` - Combo: \`${top_entry.combo.toLocaleString()}x\` - Accuracy: \`${top_entry.accuracy}%\` (\`${top_entry.miss}\` x)\nTime: \`${top_entry.date.toUTCString()}\`\n\`${top_entry.dpp} droid pp - ${top_entry.pp} PC pp\``);

        let i = 5 * (page - 1);
        if (i >= 100) i -= page_limit * 100;
        let limit = i + 5;
        for (i; i < limit; i++) {
            if (!entries[i]) break;
            let entry = entries[i].split(" ");
            let player = entry[2];
            let score = parseInt(entry[3]).toLocaleString();
            let mod = osudroid.mods.droid_to_PC(entry[6]);
            let combo = parseInt(entry[4]);
            let rank = rankEmote(entry[5]);
            let accuracy = parseFloat((parseInt(entry[7]) / 1000).toFixed(2));
            let date = new Date(parseInt(entry[9]) * 1000);
            date.setUTCHours(date.getUTCHours() + 6);
            let miss = parseInt(entry[8]);

            let star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: mod});
            let npp = osudroid.ppv2({
                stars: star.droid_stars,
                combo: combo,
                acc_percent: accuracy,
                miss: miss,
                mode: "droid"
            });
            let pcpp = osudroid.ppv2({
                stars: star.pc_stars,
                combo: combo,
                acc_percent: accuracy,
                miss: miss,
                mode: "osu"
            });
            let dpp = parseFloat(npp.total.toFixed(2));
            let pp = parseFloat(pcpp.total.toFixed(2));

            embed.addField(`**#${5 * (page_limit * 20) + i + 1} ${client.emojis.cache.get(rank)} ${player}**${mod ? ` **(+${mod})**` : ""}`, `**Score**: \`${score}\` - Combo: \`${combo.toLocaleString()}x\` - Accuracy: \`${accuracy}%\` (\`${miss}\` x)\nTime: \`${date.toUTCString()}\`\n\`${dpp} droid pp - ${pp} PC pp\``)
        }
        resolve([cache, embed])
    })
}

module.exports.run = async (client, message, args, maindb, alicedb, current_map) => {
    if (cd.has(message.author.id)) return message.channel.send("❎ **| Hey, calm down with the command! I need to rest too, you know.**");
    let beatmap_id;
    let hash;
    if (!args[0]) {
        let channel_index = current_map.findIndex(map => map[0] === message.channel.id);
        if (channel_index !== -1) hash = current_map[channel_index][1];
    }
    else {
        let a = args[0].split("/");
        beatmap_id = parseInt(a[a.length - 1]);
        if (isNaN(beatmap_id)) return message.channel.send("❎ **| I'm sorry, that beatmap ID is invalid!**");
    }
    if (!beatmap_id && !hash) return message.channel.send("❎ **| Hey, can you at least give me a map to retrieve?**");
    let params = beatmap_id ? {beatmap_id: beatmap_id} : {hash: hash};

    let page = parseInt(args[1]);
    if (!isFinite(page) || page < 1) page = 1;

    const mapinfo = await new osudroid.MapInfo().get(params);
    if (mapinfo.error) return message.channel.send("❎ **| I'm sorry, I couldn't fetch beatmap info! Perhaps osu! API is down?**");
    if (!mapinfo.title) return message.channel.send("❎ **| I'm sorry, I couldn't find the map that you are looking for!**");
    if (!mapinfo.objects) return message.channel.send("❎ **| I'm sorry, it seems like the map has 0 objects!**");
    if (!mapinfo.osu_file) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! servers. Please try again!**");
    hash = mapinfo.hash;
    let top = await fetchScores(hash, 0);
    if (!top) return message.channel.send("❎ **| I'm sorry, this map has no scores submitted yet! Perhaps osu!droid server is down?**");
    let cache = [
        {
            page: 0,
            scores: top
        }
    ];
    top = top[0].split(" ");
    let top_score = parseInt(top[3]).toLocaleString();
    let top_mod = osudroid.mods.droid_to_PC(top[6]);
    let top_combo = parseInt(top[4]);
    let top_rank = rankEmote(top[5]);
    let top_accuracy = parseFloat((parseInt(top[7]) / 1000).toFixed(2));
    let top_date = new Date(parseInt(top[9]) * 1000);
    top_date.setUTCHours(top_date.getUTCHours() + 6);
    let top_miss = parseInt(top[8]);

    let global_star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: ""});
    let top_star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: top_mod});

    let npp = osudroid.ppv2({
        stars: top_star.droid_stars,
        combo: top_combo,
        acc_percent: top_accuracy,
        miss: top_miss,
        mode: "droid"
    });
    let pcpp = osudroid.ppv2({
        stars: top_star.pc_stars,
        combo: top_combo,
        acc_percent: top_accuracy,
        miss: top_miss,
        mode: "osu"
    });
    let dpp = parseFloat(npp.total.toFixed(2));
    let pp = parseFloat(pcpp.total.toFixed(2));

    top = {
        name: top[2],
        score: top_score,
        combo: top_combo,
        mod: top_mod,
        rank: top_rank,
        accuracy: top_accuracy,
        date: top_date,
        miss: top_miss,
        dpp: dpp,
        pp: pp
    };

    let rolecheck;
    try {
        rolecheck = message.member.roles.highest.hexColor
    } catch (e) {
        rolecheck = "#000000"
    }
    let footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);

    let entry = await editEmbed(client, hash, cache, rolecheck, page, mapinfo, top, footer, index, global_star);
    if (!entry) return message.channel.send("❎ **| I'm sorry, looks like the map doesn't have that many scores!**");
    cache = entry[0];
    let embed = entry[1];
    message.channel.send({embed: embed}).then(msg => {
        msg.react("⏮️").then(() => {
            msg.react("⬅️").then(() => {
                msg.react("➡️").then(() => {
                    msg.react("⏭️").catch(console.error)
                })
            })
        });

        let backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 120000});
        let back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 120000});
        let next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 120000});
        let forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 120000});

        backward.on('collect', async () => {
            if (page === 1) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
            page = Math.max(1, page -= 10);
            msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
            entry = await editEmbed(client, hash, cache, rolecheck, page, mapinfo, top, footer, index, global_star);
            if (!entry) return;
            cache = entry[0];
            embed = entry[1];
            msg.edit({embed: embed}).catch(console.error)
        });

        back.on('collect', async () => {
            if (page !== 1) page--;
            else return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
            msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
            entry = await editEmbed(client, hash, cache, rolecheck, page, mapinfo, top, footer, index, global_star);
            if (!entry) return;
            cache = entry[0];
            embed = entry[1];
            msg.edit({embed: embed}).catch(console.error)
        });

        next.on('collect', async () => {
            page++;
            msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
            entry = await editEmbed(client, hash, cache, rolecheck, page, mapinfo, top, footer, index, global_star);
            if (!entry) return;
            cache = entry[0];
            embed = entry[1];
            msg.edit({embed: embed}).catch(console.error)
        });

        forward.on('collect', async () => {
            page += 10;
            msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
            entry = await editEmbed(client, hash, cache, rolecheck, page, mapinfo, top, footer, index, global_star);
            if (!entry) return;
            cache = entry[0];
            embed = entry[1];
            msg.edit({embed: embed}).catch(console.error)
        });

        backward.on("end", () => {
            msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id));
            msg.reactions.cache.forEach((reaction) => reaction.users.remove(client.user.id))
        })
    });
    cd.add(message.author.id);
    setTimeout(() => {
        cd.delete(message.author.id)
    }, 20000)
};

module.exports.config = {
    name: "maplb",
    description: "Retrieves a map's leaderboard.",
    usage: "maplb <beatmap id> [page]",
    detail: "`beatmap id`: The beatmap ID to retrieve [Integer]\n`page`: Leaderboard page to view (defaults at 1) [Integer]",
    permission: "None"
};