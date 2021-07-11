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

        const { hitObjectData } = data;
        let hit_error_total = 0;
        let total = 0;
        let _total = 0;
        let count = 0;
        let _count = 0;

        for (let i = 0; i < hitObjectData.length; ++i) {
            const objectData = hitObjectData[i];
            if (objectData.result === osudroid.hitResult.RESULT_0) {
                continue;
            }
            const accuracy = objectData.accuracy;
            hit_error_total += accuracy;
            if (accuracy >= 0) {
                total += accuracy;
                ++count;
            } else {
                _total += accuracy;
                ++_count;
            }
        }
        
        const mean = hit_error_total / hitObjectData.length;

        let std_deviation = 0;
        for (const hitObject of hitObjectData) {
            if (hitObject.result !== osudroid.hitResult.RESULT_0) {
                std_deviation += Math.pow(hitObject.accuracy - mean, 2);
            }
        }
        unstable_rate = Math.sqrt(std_deviation / hitObjectData.length) * 10;
        max_error = count ? total / count : 0;
        min_error = _count ? _total / _count : 0;
    }

    if (!message.isOwner) {
        cd.add(message.author.id);
        setTimeout(() => {
            cd.delete(message.author.id);
        }, 15000);
    }
    
    if (mapinfo.error || !mapinfo.title || !mapinfo.objects || !mapinfo.osuFile || !data) {
        embed.setDescription(`▸ ${rank} ▸ ${acc}%\n‣ ${score} ▸ ${combo}x ▸ [${n300}/${n100}/${n50}/${miss}]${data ? `\n▸ ${min_error.toFixed(2)}ms - ${max_error.toFixed(2)}ms hit error avg ▸ ${unstable_rate.toFixed(2)} UR` : ""}`);
        return message.channel.send(`✅ **| Comparison play for ${name}:**`, {embed: embed});
    }
    
    const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mod, stats});
    const starsline = parseFloat(star.droidStars.total.toFixed(2));
    const pcstarsline = parseFloat(star.pcStars.total.toFixed(2));

    replay.map = star.droidStars;
    replay.checkFor3Finger();

    embed.setAuthor(`${mapinfo.fullTitle} ${play.getCompleteModString()} [${starsline}★ | ${pcstarsline}★]`, player.avatarURL, `https://osu.ppy.sh/b/${mapinfo.beatmapID}`)
        .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapsetID}l.jpg`);

    const realAcc = new osudroid.Accuracy({
        n300,
        n100,
        n50,
        nmiss: miss
    });

    const npp = new osudroid.DroidPerformanceCalculator().calculate({
        stars: star.droidStars,
        combo: combo,
        accPercent: realAcc,
        tapPenalty: replay.tapPenalty,
        stats
    });

    const pcpp = new osudroid.OsuPerformanceCalculator().calculate({
        stars: star.pcStars,
        combo: combo,
        accPercent: realAcc,
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
    const notFullCombo = miss > 0 || data?.isFullCombo;
    let beatmapInformation = `▸ ${rank} ▸ **${ppline}DPP**${replay.tapPenalty !== 1 ? " (*penalized*)" : ""} | **${pcppline}PP** `;

    if (notFullCombo) {
        const fc_dpp = new osudroid.DroidPerformanceCalculator().calculate({
            stars: star.droidStars,
            combo: mapinfo.maxCombo,
            accPercent: fc_acc,
            tapPenalty: replay.tapPenalty,
            stats
        });

        const fc_pp = new osudroid.OsuPerformanceCalculator().calculate({
            stars: star.pcStars,
            combo: mapinfo.maxCombo,
            accPercent: fc_acc,
            stats
        });

        const dline = parseFloat(fc_dpp.total.toFixed(2));
        const pline = parseFloat(fc_pp.total.toFixed(2));

        beatmapInformation += `(${dline}DPP, ${pline}PP for ${(fc_acc.value() * 100).toFixed(2)}% FC) `;
    }

    let collectedSliderTicks = 0;
    let collectedSliderEnds = 0;
    if (data) {
        // Get amount of slider ticks and ends hit
        for (let i = 0; i < data.hitObjectData.length; ++i) {
            const object = mapinfo.map.objects[i];
            const objectData = data.hitObjectData[i];
            if (objectData.result === osudroid.hitResult.RESULT_0 || !(object instanceof osudroid.Slider)) {
                continue;
            }

            // Exclude head circle
            const nestedObjects = object.nestedHitObjects.slice(1);

            for (let i = 0; i < nestedObjects.length; i++) {
                if (!objectData.tickset[i]) {
                    continue;
                }

                if (nestedObjects[i] instanceof osudroid.SliderTick) {
                    ++collectedSliderTicks;    
                } else if (nestedObjects[i] instanceof osudroid.TailCircle) {
                    ++collectedSliderEnds;
                }
            }
        }
    }

    beatmapInformation += `▸ ${acc}%\n▸ ${score} ▸ ${combo}x/${mapinfo.maxCombo}x ▸ [${n300}/${n100}/${n50}/${miss}]${data ? `\n▸ ${collectedSliderTicks}/${mapinfo.map.sliderTicks} slider ticks ▸ ${collectedSliderEnds}/${mapinfo.map.sliderEnds} slider ends\n▸ ${min_error.toFixed(2)}ms - ${max_error.toFixed(2)}ms hit error avg ▸ ${unstable_rate.toFixed(2)} UR` : ""}`;
    embed.setDescription(beatmapInformation);

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