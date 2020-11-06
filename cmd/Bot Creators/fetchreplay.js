const Discord = require('discord.js');
const config = require('../../config.json');
const osudroid = require('osu-droid');
const AdmZip = require('adm-zip');
const { Db } = require('mongodb');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {stringp} args 
 * @param {Db} maindb 
 */
module.exports.run = async (client, message, args, maindb) => {
    if (message.channel.type !== 'text') {
        return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
    }
    if (!message.isOwner) {
        return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this.**");
    }

    let uid, beatmap, hash;
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
        uid = res.uid;
        if (args[0].startsWith("h:")) {
            hash = args[0].split(":")[1];
        } else {
            beatmap = args[0];
        }
        if (!beatmap && !hash) {
            return message.channel.send("❎ **| Hey, please enter a valid beatmap link/ID or hash!**")
        }
    }

    if (typeof beatmap === 'string') {
        const a = beatmap.split("/");
        beatmap = a[a.length - 1];
    }
    if (beatmap) beatmap = parseInt(beatmap);
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
    }
    const play = await osudroid.Score.getFromHash({uid: uid, hash: hash});
    if (!play.scoreID) {
        return message.channel.send(`❎ **| I'm sorry, ${args[1] ? "that uid does" : "you do"} not have a score submitted on that beatmap!**`);
    }
    
    const replay = await new osudroid.ReplayAnalyzer({scoreID: play.scoreID}).analyze();
    const data = replay.data;
    if (!data) {
        return message.channel.send("❎ **| I'm sorry, I cannot find the replay of the score!**");
    }

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
            h300k: isOldReplay ? 0 : data.hit300k,
            h300: isOldReplay ? 0 : data.hit300,
            h100k: isOldReplay ? 0 : data.hit100k,
            h100: isOldReplay ? 0 : data.hit100,
            h50: isOldReplay ? 0 : data.hit50,
            misses: play.miss,
            accuracy: isOldReplay ? play.accuracy / 100 : data.accuracy,
            time: play.date.getTime(),
            perfect: isOldReplay ? (play.miss > 0 ? 0 : 1) : data.isFullCombo
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

    if (!beatmap) {
        return message.channel.send(`✅ **| Successfully fetched replay.\n\nRank: ${play.rank}\nScore: ${play.score.toLocaleString()}\nMax Combo: ${play.combo}x\nAccuracy: ${play.accuracy}% [${data.hit300}/${data.hit100}/${data.hit50}/${data.hit0}]\n\nError: ${min_error.toFixed(2)}ms - ${max_error.toFixed(2)}ms avg\nUnstable Rate: ${unstable_rate.toFixed(2)}**`, {files: [attachment]});
    }

    const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: data.convertedMods});
    // replay.map = star.droidStars;
    // replay.analyzeReplay();

	let starsline = parseFloat(star.droidStars.total.toFixed(2));
	let pcstarsline = parseFloat(star.pcStars.total.toFixed(2));
    let npp = new osudroid.PerformanceCalculator().calculate({
        stars: star.droidStars,
        combo: play.combo,
        accPercent: play.accuracy,
        miss: play.miss,
        mode: osudroid.modes.droid
    });
	let pcpp = new osudroid.PerformanceCalculator().calculate({
        stars: star.pcStars,
        combo: play.combo,
        accPercent: play.accuracy,
        miss: play.miss,
        mode: osudroid.modes.osu
    });
	let ppline = parseFloat(npp.total.toFixed(2));
	let pcppline = parseFloat(pcpp.total.toFixed(2));
    const footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);
    const embed = new Discord.MessageEmbed()
        .setFooter(`Achieved on ${play.date.toUTCString()} | Alice Synthesis Thirty`, footer[index])
        .setAuthor(`Play Information for ${play.username}`, "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg", `http://ops.dgsrz.com/profile.php?uid=${uid}`)
        .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapsetID}l.jpg`)
        .setColor(mapinfo.statusColor())
        .attachFiles([attachment])
		.setTitle(mapinfo.showStatistics(data.convertedMods, 0))
        .setDescription(mapinfo.showStatistics(data.convertedMods, 1))
		.setURL(`https://osu.ppy.sh/b/${mapinfo.beatmapID}`)
        .addField(mapinfo.showStatistics(data.convertedMods, 2), mapinfo.showStatistics(data.convertedMods, 3))
        .addField(mapinfo.showStatistics(data.convertedMods, 4), `${mapinfo.showStatistics(data.convertedMods, 5)}\n**Result**: ${play.score.toLocaleString()} / ${play.rank} / ${play.combo}/${mapinfo.maxCombo}x / ${play.accuracy}% / [${data.hit300}/${data.hit100}/${data.hit50}/${data.hit0}]\n**Error**: ${min_error.toFixed(2)}ms - ${max_error.toFixed(2)}ms avg\n**Unstable Rate**: ${unstable_rate.toFixed(2)}`)
        .addField(`**Droid pp (Experimental)**: __${ppline} pp__ - ${starsline} stars`, `**PC pp**: ${pcppline} pp - ${pcstarsline} stars`);

    message.channel.send({embed: embed});
};

module.exports.config = {
	name: "fetchreplay",
    description: "Fetches replay from a player or yourself on a beatmap.\n\nIf the second argument is omitted, your binded uid will be taken as the uid to fetch the replay from.",
	usage: "fetchreplay <beatmap/uid> [beatmap]",
	detail: "`beatmap`: The beatmap link, ID, or MD5 hash (prefix with `h:` if using hash) [Integer/String]\n`uid`: The uid of the player [Integer]",
	permission: "None"
};