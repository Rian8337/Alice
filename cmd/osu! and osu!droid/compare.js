const Discord = require('discord.js');
const config = require('../../config.json');
const osudroid = require('osu-droid');
const { Db } = require('mongodb');
const cd = new Set();

function rankEmote(input) {
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
    if (message.channel.type !== "text") {
        return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
    }
    if (cd.has(message.author.id)) {
        return message.channel.send("❎ **| Hey, calm down with the command! I need to rest too, you know.**");
    }
    const channel_index = current_map.findIndex(map => map[0] === message.channel.id);
    if (channel_index === -1) {
        return message.channel.send("❎ **| I'm sorry, there is no map being talked in the channel!**");
    }
    const hash = current_map[channel_index][1];

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

    const play = await osudroid.Score.getFromHash({uid: uid, hash: hash});
    if (play.error) {
        return message.channel.send("❎ **| I'm sorry, I couldn't check the map's scores! Perhaps osu!droid server is down?**");
    }
    if (!play.title) {
        return message.channel.send("❎ **| I'm sorry, you don't have a score in the beatmap!**");
    }
    const name = play.username;
    const score = play.score.toLocaleString();
    const combo = play.combo;
    const rank = client.emojis.cache.get(rankEmote(play.rank));
    const mod = play.mods;
    const acc = play.accuracy;
    const miss = play.miss;
    const date = play.date;
    let title = `${play.title} ${play.getCompleteModString()}`;

    const player = await osudroid.Player.getInformation({username: name});
    if (player.error) {
        return message.channel.send("❎ **| I'm sorry, I couldn't fetch your profile! Perhaps osu!droid server is down?**");
    }

    const footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);
    const embed = new Discord.MessageEmbed()
        .setAuthor(title, player.avatarURL)
        .setColor(message.member.roles.color?.hexColor || 8311585)
        .setFooter(`Achieved on ${date.toUTCString()} | Alice Synthesis Thirty`, footer[index]);

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
        embed.addField("📈 | **Information**", `**Rank**: ${rank}\n**Score**: ${score}\n**Combo**: ${combo}x\n**Accuracy**: ${acc}% ▧ [${n300}/${n100}/${n50}/${miss}]${unstable_rate ? `\n**Error**: ${min_error.toFixed(2)}ms - ${max_error.toFixed(2)}ms (${unstable_rate.toFixed(2)} UR)` : ""}`);
        return message.channel.send(`✅ **| Comparison play for ${name}:**`, {embed: embed});
    }
    
    const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mod, stats});
    const starsline = parseFloat(star.droidStars.total.toFixed(2));
    const pcstarsline = parseFloat(star.pcStars.total.toFixed(2));

    replay.map = star.droidStars;
    replay.checkFor3Finger();

    embed.setAuthor(`${mapinfo.fullTitle} ${play.getCompleteModString()}`, player.avatarURL, `https://osu.ppy.sh/b/${mapinfo.beatmapID}`)
        .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapsetID}l.jpg`);

    const realAcc = new osudroid.Accuracy({
        n300,
        n100,
        n50,
        nmiss: miss
    });

    const npp = new osudroid.PerformanceCalculator().calculate({
        stars: star.droidStars,
        combo: combo,
        accPercent: realAcc,
        mode: osudroid.modes.droid,
        speedPenalty: replay.penalty,
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

    const fc_acc = new osudroid.Accuracy({
        n300: n300 + miss,
        n100,
        n50,
        nmiss: 0
    });
    const notFullCombo = miss > 0 || combo < mapinfo.maxCombo;
    embed.addField("📈 | **Information**", `**Rank**: ${rank}\n**Score**: ${score}\n**Combo**: ${combo}x/${mapinfo.maxCombo}x\n**Accuracy**: ${acc}% ▧ [${n300}/${n100}/${n50}/${miss}]${notFullCombo ? ` **(FC: ${(fc_acc.value() * 100).toFixed(2)}%)**` : ""}${unstable_rate ? `\n**Error**: ${min_error.toFixed(2)}ms - ${max_error.toFixed(2)}ms (${unstable_rate.toFixed(2)} UR)` : ""}`);
    let performanceInformation = "";

    if (notFullCombo) {
        const fc_dpp = new osudroid.PerformanceCalculator().calculate({
            stars: star.droidStars,
            combo: mapinfo.maxCombo,
            accPercent: fc_acc,
            mode: osudroid.modes.droid,
            speedPenalty: replay.penalty,
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

        performanceInformation += `**Droid**: ${starsline}★ ▧ **${ppline} (FC: ${dline})**\n**PC**: ${pcstarsline}★ ▧ **${pcppline} (FC: ${pline})**\n`;
    } else {
        performanceInformation += `**Droid**: ${starsline}★ ▧ **${ppline}**\n**PC**: ${pcstarsline}★ ▧ **${pcppline}**\n`;
    }

    if (replay.penalty !== 1) {
        const noPenaltyDpp = new osudroid.PerformanceCalculator().calculate({
            stars: star.droidStars,
            combo,
            accPercent: realAcc,
            mode: osudroid.modes.droid,
            stats
        });

        performanceInformation += `**Droid (no penalty)**: **${noPenaltyDpp.total.toFixed(2)}`;

        if (notFullCombo) {
            const noPenaltyFCDpp = new osudroid.PerformanceCalculator().calculate({
                stars: star.droidStars,
                combo: mapinfo.maxCombo,
                accPercent: fc_acc,
                mode: osudroid.modes.droid,
                stats
            });

            performanceInformation += ` (FC: ${noPenaltyFCDpp.total.toFixed(2)})`;
        }

        performanceInformation += "**";
    }

    embed.addField("🔼 | **Difficulty and Performance**", performanceInformation);

    message.channel.send(`✅ **| Comparison play for ${name}:**`, {embed: embed});
};

module.exports.config = {
    name: "compare",
    aliases: "c",
    description: "Compares your play amongst others.",
    usage: "compare [uid/user]",
    detail: "`uid`: The uid you want to compare [Integer]\n`user`: The user you want to compare [UserResolvable (mention or user ID)]",
    permission: "None"
};