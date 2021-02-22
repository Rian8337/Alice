const Discord = require('discord.js');
const config = require('../../config.json');
const osudroid = require('osu-droid');
const { Db } = require('mongodb');
const cd = new Set();

function rankEmote(input) {
	if (!input) return;
	switch (input) {
		case 'A': return '611559473236148265';
		case 'B': return '611559473169039413';
		case 'C': return '611559473328422942';
		case 'D': return '611559473122639884';
		case 'S': return '611559473294606336';
		case 'X': return '611559473492000769';
		case 'SH': return '611559473361846274';
		case 'XH': return '611559473479155713';
		default : return;
	}
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

    const bindDb = maindb.collection("userbind");
    let uid = 0;

    if (args[0]) {
        if (args[0].length < 18) {
            uid = parseInt(args[0]);
            if (isNaN(uid)) {
                return message.channel.send("❎ **| I'm sorry, your first argument is invalid! Please enter a uid, user, or user ID!**");
            }
            if (uid <= 2417) {
                return message.channel.send("❎ **| Hey, that uid is too small!**");
            }
            if (uid >= 500000) {
                return message.channel.send("❎ **| Hey, that uid is too big!**");
            }
        } else {
            const ufind = args[0].replace(/[<@!>]/g, "");
            if (ufind.length !== 18) {
                return message.channel.send("❎ **| I'm sorry, your first argument is invalid! Please enter a uid, user, or user ID!**");
            }
            uid = await bindDb.findOne({discordid: ufind});
            if (!uid) {
                if (args[0]) {
                    message.channel.send("❎ **| I'm sorry, that account is not binded. The user needs to bind his/her account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**")
                } else {
                    message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                }
                return;
            }
            uid = uid.uid;
        }
    }

    if (!uid) {
        uid = await bindDb.findOne({discordid: message.author.id});
        if (!uid) {
            if (args[0]) {
                message.channel.send("❎ **| I'm sorry, that account is not binded. The user needs to bind his/her account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**")
            } else {
                message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
            }
            return;
        }
        uid = uid.uid;
    }

    const player = await osudroid.Player.getInformation({uid: uid});
    if (player.error) {
        if (args[0]) {
            message.channel.send("❎ **| I'm sorry, I couldn't fetch the user's profile! Perhaps osu!droid server is down?**");
        } else {
            message.channel.send("❎ **| I'm sorry, I couldn't fetch your profile! Perhaps osu!droid server is down?**");
        }
        return;
    }
    if (!player.username) {
        if (args[0]) {
            message.channel.send("❎ **| I'm sorry, I couldn't find the user's profile!**");
        } else {
            message.channel.send("❎ **| I'm sorry, I couldn't find your profile!**");
        }
        return;
    }
    if (player.recentPlays.length === 0) {
        return message.channel.send("❎ **| I'm sorry, this player hasn't submitted any play!**");
    }

    const name = player.username;
    const play = player.recentPlays[0];
    const score = play.score.toLocaleString();
    const combo = play.combo;
    const rank = client.emojis.cache.get(rankEmote(play.rank));
    const ptime = play.date;
    const acc = play.accuracy;
    const miss = play.miss;
    const mod = play.mods;
    const hash = play.hash;
    let title = `${play.title} ${play.getCompleteModString()}`;
    
    const footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);
    const embed = new Discord.MessageEmbed()
        .setAuthor(title, player.avatarURL)
        .setColor(message.member?.roles.color?.hexColor || 8311585)
        .setFooter(`Achieved on ${ptime.toUTCString()} | Alice Synthesis Thirty`, footer[index]);

    const entry = [message.channel.id, hash];
    const map_index = current_map.findIndex(map => map[0] === message.channel.id);
    if (map_index === -1) {
        current_map.push(entry);
    } else {
        current_map[map_index][1] = hash;
    }

    const mapinfo = await osudroid.MapInfo.getInformation({hash: hash});
    const n300 = play.hit300;
    const n100 = play.hit100;
    const n50 = play.hit50;
    let unstable_rate = 0;
    let min_error = 0;
    let max_error = 0;

    const params = {
        scoreID: play.scoreID
    };
    if (mapinfo.map) {
        params.map = mapinfo.map;
    }

    const replay = await new osudroid.ReplayAnalyzer(params).analyze();
    const { data } = replay;
    const stats = new osudroid.MapStats({
        ar: play.forcedAR,
        speedMultiplier: play.speedMultiplier,
        isForceAR: !isNaN(play.forcedAR)
    });
    if (replay.fixedODR) {

        stats.oldStatistics = data.replayVersion <= 3;

        const hit_object_data = data.hitObjectData;
        let hit_error_total = 0;
        let total = 0;
        let _total = 0;
        let count = 0;
        let _count = 0;

        for (const hit_object of hit_object_data) {
            if (hit_object.result === osudroid.hitResult.RESULT_0) {
                continue;
            }
            const accuracy = hit_object.accuracy;
            hit_error_total += accuracy;
            if (accuracy >= 0) {
                total += accuracy;
                ++count;
            } else {
                _total += accuracy;
                ++_count;
            }
        }
        
        const mean = hit_error_total / hit_object_data.length;

        let std_deviation = 0;
        for (const hit_object of hit_object_data) {
            if (hit_object.result !== osudroid.hitResult.RESULT_0) {
                std_deviation += Math.pow(hit_object.accuracy - mean, 2);
            }
        }
        unstable_rate = Math.sqrt(std_deviation / hit_object_data.length) * 10;
        max_error = count ? total / count : 0;
        min_error = _count ? _total / _count : 0;
    }

    if (!message.isOwner) {
        cd.add(message.author.id);
        setTimeout(() => {
            cd.delete(message.author.id);
        }, 15000);
    }
    
    if (mapinfo.error || !mapinfo.title || !mapinfo.objects || !mapinfo.osuFile) {
        embed.setDescription(`▸ ${rank} ▸ ${acc}%\n‣ ${score} ▸ ${combo}x ▸ [${n300}/${n100}/${n50}/${miss}] ${unstable_rate ? `\n▸ ${min_error.toFixed(2)}ms - ${max_error.toFixed(2)}ms hit error avg ▸ ${unstable_rate.toFixed(2)} UR` : ""}`);
        return message.channel.send(`✅ **| Most recent play for ${name}:**`, {embed: embed});
    }

    const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mod, stats});
    const starsline = parseFloat(star.droidStars.total.toFixed(2));
    const pcstarsline = parseFloat(star.pcStars.total.toFixed(2));

    title = `${mapinfo.fullTitle} ${play.getCompleteModString()} [${starsline}★ | ${pcstarsline}★]`;

    embed.setAuthor(title, player.avatarURL, `https://osu.ppy.sh/b/${mapinfo.beatmapID}`)
        .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapsetID}l.jpg`);

    let realAcc = new osudroid.Accuracy({
        percent: acc,
        nobjects: mapinfo.objects
    });

    if (replay.fixedODR) {
        realAcc = new osudroid.Accuracy({
            n300: n300,
            n100: n100,
            n50: n50,
            nmiss: miss
        });
    }

    const npp = new osudroid.PerformanceCalculator().calculate({
        stars: star.droidStars,
        combo: combo,
        accPercent: realAcc,
        mode: osudroid.modes.droid,
        stats
    });

    const pcpp = new osudroid.PerformanceCalculator().calculate({
        stars: star.pcStars,
        combo: combo,
        accPercent: realAcc,
        mode: osudroid.modes.osu,
        stats
    });

    const ppline = parseFloat(npp.total.toFixed(2));
    const pcppline = parseFloat(pcpp.total.toFixed(2));

    if (miss > 0 || combo < mapinfo.maxCombo) {
        const fc_acc = new osudroid.Accuracy({
            n300: (n300 ? n300 : npp.computedAccuracy.n300) + miss,
            n100: n100 ? n100 : npp.computedAccuracy.n100,
            n50 : n50 ? n50 : npp.computedAccuracy.n50,
            nmiss: 0
        });

        const fc_dpp = new osudroid.PerformanceCalculator().calculate({
            stars: star.droidStars,
            combo: mapinfo.maxCombo,
            accPercent: fc_acc,
            mode: osudroid.modes.droid,
            stats
        });

        const fc_pp = new osudroid.PerformanceCalculator().calculate({
            stars: star.pcStars,
            combo: mapinfo.maxCombo,
            accPercent: fc_acc,
            mode: osudroid.modes.osu,
            stats
        });

        const dline = parseFloat(fc_dpp.total.toFixed(2));
        const pline = parseFloat(fc_pp.total.toFixed(2));

        embed.setDescription(`▸ ${rank} ▸ **${ppline}DPP** | **${pcppline}PP** (${dline}DPP, ${pline}PP for ${(fc_acc.value() * 100).toFixed(2)}% FC) ▸ ${acc}%\n▸ ${score} ▸ ${combo}x/${mapinfo.maxCombo}x ▸ [${n300}/${n100}/${n50}/${miss}] ${unstable_rate ? `\n▸ ${min_error.toFixed(2)}ms - ${max_error.toFixed(2)}ms hit error avg ▸ ${unstable_rate.toFixed(2)} UR` : ""}`);
    } else {
        embed.setDescription(`▸ ${rank} ▸ **${ppline}DPP** | **${pcppline}PP** ▸ ${acc}%\n▸ ${score} ▸ ${combo}x/${mapinfo.maxCombo}x ▸ [${n300}/${n100}/${n50}/${miss}] ${unstable_rate ? `\n▸ ${min_error.toFixed(2)}ms - ${max_error.toFixed(2)}ms hit error avg ▸ ${unstable_rate.toFixed(2)} UR` : ""}`);
    }

    message.channel.send(`✅ **| Most recent play for ${name}:**`, {embed: embed});
};

module.exports.config = {
    name: "recent",
    aliases: "rs",
    description: "Retrieves a uid or user's most recent play.",
    usage: "recent [uid/user]",
    detail: "`uid`: The uid to retrieve [Integer]\n`user`: The user to retrieve [UserResolvable (mention or user ID)]",
    permission: "None"
};