const Discord = require('discord.js');
const config = require('../../config.json');
const osudroid = require('osu-droid');
const AdmZip = require('adm-zip');
const { Db } = require('mongodb');
const cd = new Set();

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 */
module.exports.run = async (client, message, args, maindb) => {
    if (cd.has(message.author.id)) {
        return message.channel.send("❎ **| Hey, calm down with the command! I need to rest too, you know.**");
    }

    let uid, beatmap = "", hash = "";
    if (args[1]) {
        uid = parseInt(args[0]);
        if (isNaN(uid)) {
            return message.channel.send("❎ **| Hey, please enter a valid uid!**");
        }
        if (args[1].startsWith("h:")) {
            hash = args[1].split(":")[1];
        } else {
            beatmap = args[1];
        }
    } else {
        const res = await maindb.collection("userbind").findOne({discordid: message.author.id});
        if (!res) {
            return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
        }
        if (!args[0]) {
            return message.channel.send("❎ **| Hey, please enter a beatmap ID and/or uid to fetch the replay from!**");
        }
        uid = res.uid;
        if (args[0].startsWith("h:")) {
            hash = args[0].split(":")[1];
        } else {
            beatmap = args[0];
        }
        if (!beatmap && !hash) {
            return message.channel.send("❎ **| Hey, please enter a valid beatmap link/ID or hash!**");
        }
    }

    const a = beatmap.split("/");
    beatmap = a[a.length - 1];
    if (beatmap) {
        beatmap = parseInt(beatmap);
    }
    if (isNaN(beatmap) && !hash) {
        return message.channel.send("❎ **| Hey, please enter a valid beatmap link or ID!**");
    }

    let mapinfo;
    if (beatmap) {
        mapinfo = await osudroid.MapInfo.getInformation({beatmapID: beatmap});
        if (mapinfo.error) {
            return message.channel.send("❎ **| I'm sorry, I cannot fetch beatmap info from osu! API! Perhaps it is down?**");
        }
        if (!mapinfo.title) {
            return message.channel.send("❎ **| I'm sorry, I cannot find the beatmap that you are looking for!**");
        }
        if (!mapinfo.objects) {
            return message.channel.send("❎ **| I'm sorry, it seems like the beatmap has 0 objects!**");
        }
        hash = mapinfo.hash;
    } else if (hash) {
        mapinfo = await osudroid.MapInfo.getInformation({hash: hash});
    }
    const play = await osudroid.Score.getFromHash({uid: uid, hash: hash});
    if (!play.scoreID) {
        return message.channel.send(`❎ **| I'm sorry, ${args[1] ? "that uid does" : "you do"} not have a score submitted on that beatmap!**`);
    }
    const mapFound = !!mapinfo.title;
    const replay = await new osudroid.ReplayAnalyzer({scoreID: play.scoreID, map: mapFound ? mapinfo.map : undefined}).analyze();
    const { data } = replay;
    if (!data) {
        return message.channel.send("❎ **| I'm sorry, I cannot find the replay of the score!**");
    }

    if (!message.isOwner) {
        cd.add(message.author.id);
        setTimeout(() => {
            cd.delete(message.author.id);
        }, 30000);
    }

    const star = mapFound ? new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: play.mods, stats: {oldStatistics: data.replayVersion <= 3}}) : undefined;
    const isOldReplay = data.replayVersion < 3;

    const zip = new AdmZip();
    zip.addFile(`${play.scoreID}.odr`, replay.originalODR);
    const object = {
        version: 1,
        replaydata: {
            filename: `${data.folderName}\/${data.fileName}`,
            playername: isOldReplay ? play.username : data.playerName,
            replayfile: `${play.scoreID}.odr`,
            mod: isOldReplay ? play.droidMods : data.droidMods,
            score: play.score,
            combo: play.combo,
            mark: play.rank,
            h300k: mapFound || !isOldReplay ? data.hit300k : 0,
            h300: mapFound || !isOldReplay ? data.hit300 : 0,
            h100k: mapFound || !isOldReplay ? data.hit100k : 0,
            h100: mapFound || !isOldReplay ? data.hit100 : 0,
            h50: mapFound || !isOldReplay ? data.hit50 : 0,
            misses: play.miss,
            accuracy: isOldReplay ? play.accuracy / 100 : data.accuracy,
            time: play.date.getTime(),
            perfect: isOldReplay ? (play.miss === 0 ? 1 : 0) : (data.isFullCombo ? 1 : 0)
        }
    };
    zip.addFile("entry.json", Buffer.from(JSON.stringify(object, null, 2)));
    const attachment = new Discord.MessageAttachment(zip.toBuffer(), `${data.fileName.substring(0, data.fileName.length - 4)} [${data.playerName}]-${object.replaydata.time}.edr`);
    
    const hit_object_data = data.hitObjectData;
    let hit_error_total = 0;
    let count = 0;
    let _count = 0;
    let total = 0;
    let _total = 0;

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
    for (const hit_object of hit_object_data)
        if (hit_object.result !== osudroid.hitResult.RESULT_0) std_deviation += Math.pow(hit_object.accuracy - mean, 2);
    
    const unstable_rate = Math.sqrt(std_deviation / hit_object_data.length) * 10;
    const max_error = count ? total / count : 0;
    const min_error = _count ? _total / _count : 0;

    if (!mapFound) {
        return message.channel.send(`✅ **| Successfully fetched replay.\n\nRank: ${play.rank}\nScore: ${play.score.toLocaleString()}\nMax Combo: ${play.combo}x\nAccuracy: ${play.accuracy}% [${data.hit300}/${data.hit100}/${data.hit50}/${data.hit0}]\n\nError: ${min_error.toFixed(2)}ms - ${max_error.toFixed(2)}ms avg\nUnstable Rate: ${unstable_rate.toFixed(2)}**`, {files: [attachment]});
    }

    replay.map = star.droidStars;
    replay.checkFor3Finger();

    const stats = new osudroid.MapStats({
        ar: play.forcedAR,
        speedMultiplier: play.speedMultiplier,
        isForceAR: !isNaN(play.forcedAR),
        oldStatistics: data.replayVersion <= 3
    });

    const realAcc = new osudroid.Accuracy({
        n300: data.hit300,
        n100: data.hit100,
        n50: data.hit50,
        nmiss: play.miss
    });
	const starsline = parseFloat(star.droidStars.total.toFixed(2));
	const pcstarsline = parseFloat(star.pcStars.total.toFixed(2));
    const npp = new osudroid.PerformanceCalculator().calculate({
        stars: star.droidStars,
        combo: play.combo,
        accPercent: realAcc,
        miss: play.miss,
        mode: osudroid.modes.droid,
        speedPenalty: replay.penalty,
        stats
    });
	const pcpp = new osudroid.PerformanceCalculator().calculate({
        stars: star.pcStars,
        combo: play.combo,
        accPercent: realAcc,
        miss: play.miss,
        mode: osudroid.modes.osu,
        stats
    });
	const ppline = parseFloat(npp.total.toFixed(2));
	const pcppline = parseFloat(pcpp.total.toFixed(2));
    const footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);
    const embed = new Discord.MessageEmbed()
        .setFooter(`Achieved on ${play.date.toUTCString()} | Alice Synthesis Thirty`, footer[index])
        .setAuthor(`Play Information for ${play.username}`, "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg", `http://ops.dgsrz.com/profile.php?uid=${uid}`)
        .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapsetID}l.jpg`)
        .setColor(mapinfo.statusColor())
        .attachFiles([attachment])
		.setTitle(mapinfo.showStatistics(data.convertedMods, 0, stats))
        .setDescription(mapinfo.showStatistics(data.convertedMods, 1, stats))
		.setURL(`https://osu.ppy.sh/b/${mapinfo.beatmapID}`)
        .addField(mapinfo.showStatistics(data.convertedMods, 2, stats), mapinfo.showStatistics(data.convertedMods, 3, stats))
        .addField(mapinfo.showStatistics(data.convertedMods, 4, stats), `${mapinfo.showStatistics(data.convertedMods, 5, stats)}\n**Result**: ${play.score.toLocaleString()} / ${play.rank} / ${play.combo}/${mapinfo.maxCombo}x / ${play.accuracy}% / [${data.hit300}/${data.hit100}/${data.hit50}/${data.hit0}]\n**Error**: ${min_error.toFixed(2)}ms - ${max_error.toFixed(2)}ms avg\n**Unstable Rate**: ${unstable_rate.toFixed(2)}`)
        .addField(`**Droid pp (Experimental)**: __${ppline} pp__ - ${starsline} stars`, `**PC pp**: ${pcppline} pp - ${pcstarsline} stars`);

    message.channel.send({embed: embed});
};

module.exports.config = {
	name: "fetchreplay",
    description: "Fetches replay from a player or yourself on a beatmap.\n\nIf the second argument is omitted, your binded uid will be taken as the uid to fetch the replay from.",
	usage: "fetchreplay <beatmap/uid> [beatmap]",
	detail: "`beatmap`: The beatmap link, ID, or MD5 hash (prefix with `h:` if using MD5 hash) [Integer/String]\n`uid`: The uid of the player [Integer]",
	permission: "None"
};