const Discord = require('discord.js');
const osudroid = require('osu-droid');
const { Db } = require('mongodb');
const config = require('../../config.json');
const cd = new Set();

/**
 * @param {string} hash 
 * @param {number} page 
 */
function fetchScores(hash, page) {
    return new Promise(async resolve => {
        const apiRequestBuilder = new osudroid.DroidAPIRequestBuilder()
            .setEndpoint("scoresearchv2.php")
            .addParameter("hash", hash)
            .addParameter("page", page)
            .addParameter("order", "score");

        const result = await apiRequestBuilder.sendRequest();
        if (result.statusCode !== 200) {
            --page;
            return resolve([]);
        }

        const entries = [];
        const lines = result.data.toString("utf-8").split("<br>");
        lines.shift();
        for (const line of lines) {
            entries.push(new osudroid.Score().fillInformation(line));
        }
        resolve(entries);
    });
}

/**
 * @param {string} input 
 */
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
            return;
    }
}

function createEmbed(client, hash, cache, color, page, mapinfo, topEntry, footer, index, globalStar) {
    return new Promise(async resolve => {
        const pageLimit = Math.floor((page - 1) / 20);
        const cacheEntry = cache.find(c => c.page === pageLimit);
        let entries;
        if (cacheEntry) {
            entries = cacheEntry.scores;
        } else {
            const scores = await fetchScores(hash, pageLimit);
            entries = scores;
            cache.push({page: pageLimit, scores});
        }

        const embed = new Discord.MessageEmbed()
            .setAuthor("Map Found", "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg")
            .setFooter(`Alice Synthesis Thirty | Page ${page}`, footer[index])
            .setColor(color);

        // NM star rating
        if (mapinfo.title) {
            embed.setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapsetID}l.jpg`)
                .setURL(`https://osu.ppy.sh/b/${mapinfo.beatmapID}`)
                .setTitle(`${mapinfo.fullTitle} (${globalStar.droidStars.total.toFixed(2)}★ | ${globalStar.pcStars.total.toFixed(2)}★)`)
                .setDescription(`${mapinfo.showStatistics("", 1)}\n\n${mapinfo.showStatistics("", 2)}\n${mapinfo.showStatistics("", 3)}\n${mapinfo.showStatistics("", 4)}\n${mapinfo.showStatistics("", 5)}`)
                .addField("**Top Score**", `**${topEntry.name}${topEntry.mod ? ` (${topEntry.modstring})` : ""}**\n▸ ${client.emojis.cache.get(topEntry.rank)} ▸ **${topEntry.dpp.toFixed(2)}DPP | ${topEntry.pp.toFixed(2)}PP** ▸ ${topEntry.accuracy.toFixed(2)}%\n▸ ${topEntry.score.toLocaleString()} ▸ ${topEntry.combo}x ▸ [${topEntry.hit300}/${topEntry.hit100}/${topEntry.hit50}/${topEntry.miss}]\n\`${topEntry.date.toUTCString()}\``);
        } else {
            embed.setTitle(entries[0].title)
                .addField("**Top Score**", `**${topEntry.name}${topEntry.mod ? ` (${topEntry.modstring})` : ""}**\n▸ ${client.emojis.cache.get(topEntry.rank)} ▸ ${topEntry.accuracy.toFixed(2)}%\n▸ ${topEntry.score.toLocaleString()} ▸ ${topEntry.combo}x ▸ [${topEntry.hit300}/${topEntry.hit100}/${topEntry.hit50}/${topEntry.miss}]\n\`${topEntry.date.toUTCString()}\``);
        }

        let i = 5 * (page - 1);
        if (i >= 100) {
            i -= pageLimit * 100;
        }
        let limit = i + 5;

        for (i; i < limit; ++i) {
            if (!entries[i]) {
                break;
            }

            const entry = entries[i];

            const player = entry.username;
            const score = entry.score;
            const mod = entry.mods;
            const combo = entry.combo;
            const rank = rankEmote(entry.rank);
            const date = entry.date;

            const n300 = entry.hit300;
            const n100 = entry.hit100;
            const n50 = entry.hit50;
            const miss = entry.miss;

            const acc = new osudroid.Accuracy({
                n300,
                n100,
                n50,
                nmiss: miss
            });

            if (mapinfo.title) {
                const stats = new osudroid.MapStats({
                    ar: entry.forcedAR,
                    speedMultiplier: entry.speedMultiplier,
                    isForceAR: !isNaN(entry.forcedAR)
                });
                const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mod, stats});

                const dpp = new osudroid.PerformanceCalculator().calculate({
                    stars: star.droidStars,
                    combo,
                    accPercent: acc,
                    mode: osudroid.modes.droid,
                    stats
                }).total;

                const pp = new osudroid.PerformanceCalculator().calculate({
                    stars: star.pcStars,
                    combo,
                    accPercent: acc,
                    miss,
                    mode: osudroid.modes.osu,
                    stats
                }).total;

                embed.addField(`**#${5 * (pageLimit * 20) + i + 1} ${player}${mod ? ` (${entry.getCompleteModString()})` : ""}**`, `▸ ${client.emojis.cache.get(rank)} ▸ **${dpp.toFixed(2)}DPP | ${pp.toFixed(2)}PP** ▸ ${(acc.value() * 100).toFixed(2)}%\n▸ ${score.toLocaleString()} ▸ ${combo}x ▸ [${n300}/${n100}/${n50}/${miss}]\n\`${date.toUTCString()}\``);
            } else {
                embed.addField(`**#${5 * (pageLimit * 20) + i + 1} ${player}${mod ? ` (${entry.getCompleteModString()})` : ""}**`, `▸ ${client.emojis.cache.get(rank)} ▸ ${(acc.value() * 100).toFixed(2)}%\n▸ ${score.toLocaleString()} ▸ ${combo}x ▸ [${n300}/${n100}/${n50}/${miss}]\n\`${date.toUTCString()}\``);
            }
        }

        resolve(embed);
    });
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 * @param {[string, string][]} current_map 
 */
module.exports.run = async (client, message, args, maindb, alicedb, current_map) => {
    if (cd.has(message.author.id)) {
        return message.channel.send("❎ **| Hey, calm down with the command! I need to rest too, you know.**");
    }

    let beatmapID, hash;
    if (!args[0]) {
        let channel_index = current_map.findIndex(map => map[0] === message.channel.id);
        if (channel_index !== -1) {
            hash = current_map[channel_index][1];
        }
    } else {
        let a = args[0].split("/");
        beatmapID = parseInt(a[a.length - 1]);
        if (isNaN(beatmapID)) {
            return message.channel.send("❎ **| I'm sorry, that beatmap ID is invalid!**");
        }
    }
    if (!beatmapID && !hash) {
        return message.channel.send("❎ **| Hey, can you at least give me a map to retrieve?**");
    }
    const params = beatmapID ? {beatmapID} : {hash};

    let page = parseInt(args[1]);
    if (!isFinite(page) || page < 1) {
        page = 1;
    }

    const mapinfo = await osudroid.MapInfo.getInformation(params);
    if (!hash && mapinfo.hash) {
        hash = mapinfo.hash;
    }
    const scores = await fetchScores(hash, 0);
    if (scores.length === 0) {
        return message.channel.send("❎ **| I'm sorry, I cannot find any scores for the beatmap!**");
    }
    const cache = [
        {
            page: 0,
            scores: scores
        }
    ];

    const topScore = scores[0];
    const score = topScore.score;
    const mod = topScore.mods;
    const combo = topScore.combo;
    const rank = rankEmote(topScore.rank);
    const acc = topScore.accuracy;
    const miss = topScore.miss;
    const date = topScore.date;

    const top = {
        name: topScore.username,
        score,
        combo,
        mod,
        rank,
        accuracy: acc,
        hit300: topScore.hit300,
        hit100: topScore.hit100,
        hit50: topScore.hit50,
        miss,
        date,
        modstring: topScore.getCompleteModString()
    };

    const globalStar = new osudroid.MapStars();
    if (mapinfo.title) {
        globalStar.calculate({file: mapinfo.osuFile});

        const stats = new osudroid.MapStats({
            ar: topScore.forcedAR,
            speedMultiplier: topScore.speedMultiplier,
            isForceAR: !isNaN(topScore.forcedAR)
        });
        
        const topStar = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mod, stats});

        const topDpp = new osudroid.PerformanceCalculator().calculate({
            stars: topStar.droidStars,
            combo,
            accPercent: acc,
            miss,
            mode: osudroid.modes.droid,
            stats
        }).total;

        const topPP = new osudroid.PerformanceCalculator().calculate({
            stars: topStar.pcStars,
            combo,
            accPercent: acc,
            miss,
            mode: osudroid.modes.osu,
            stats
        }).total;

        top.dpp = topDpp;
        top.pp = topPP;
    }

    const footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);
    const color = message.member?.roles.color?.hexColor || "#000000";
    let embed = await createEmbed(client, hash, cache, color, page, mapinfo, top, footer, index, globalStar);

    message.channel.send({embed: embed}).then(msg => {
        msg.react("⏮️").then(() => {
            msg.react("⬅️").then(() => {
                msg.react("➡️").then(() => {
                    msg.react("⏭️").catch(console.error);
                });
            });
        });

        const backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 120000});
        const back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 120000});
        const next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 120000});
        const forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 120000});

        backward.on('collect', async () => {
            if (page === 1) {
                if (message.channel.type === "text") {
                    msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                }
                return;
            }
            page = Math.max(1, page -= 10);
            if (message.channel.type === "text") {
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
            }
            embed = await createEmbed(client, hash, cache, color, page, mapinfo, top, footer, index, globalStar);
            msg.edit({embed: embed}).catch(console.error);
        });

        back.on('collect', async () => {
            if (message.channel.type === "text") {
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
            }
            if (page !== 1) {
                page--;
            } else {
                return;
            }
            if (message.channel.type === "text") {
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
            }
            embed = await createEmbed(client, hash, cache, color, page, mapinfo, top, footer, index, globalStar);
            msg.edit({embed: embed}).catch(console.error);
        });

        next.on('collect', async () => {
            page++;
            if (message.channel.type === "text") {
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
            }
            embed = await createEmbed(client, hash, cache, color, page, mapinfo, top, footer, index, globalStar);
            msg.edit({embed: embed}).catch(console.error);
        });

        forward.on('collect', async () => {
            page += 10;
            if (message.channel.type === "text") {
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
            }
            embed = await createEmbed(client, hash, cache, color, page, mapinfo, top, footer, index, globalStar);
            msg.edit({embed: embed}).catch(console.error);
        });

        backward.on("end", () => {
            if (message.channel.type === "text") {
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
            }
            msg.reactions.cache.forEach((reaction) => reaction.users.remove(client.user.id))
        });
    });
    cd.add(message.author.id);
    setTimeout(() => {
        cd.delete(message.author.id);
    }, 20000);
};

module.exports.config = {
    name: "maplb",
    description: "Retrieves a map's leaderboard.",
    usage: "maplb [beatmap link/ID] [page]",
    detail: "`beatmap id`: The beatmap link or ID to retrieve. If omitted [Integer/String]\n`page`: Leaderboard page to view (defaults at 1) [Integer]",
    permission: "None"
};