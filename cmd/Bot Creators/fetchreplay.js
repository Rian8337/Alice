const Discord = require('discord.js');
const config = require('../../config.json');
const osudroid = require('osu-droid');
const cd = new Set();
const AdmZip = require('adm-zip');

function fetchUid(binddb, query) {
    return new Promise(resolve => {
        binddb.findOne(query, (err, res) => {
            if (err || !res) return resolve(null);
            resolve(parseInt(res.uid))
        })
    })
}

module.exports.run = async (client, message, args, maindb) => {
    if (message.channel.type !== 'text') return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
    if (!message.isOwner) return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this.**");
    if (cd.has(message.author.id)) return message.channel.send("❎ **| Hey, you're still in cooldown! Please wait for a minute or two before using this command again!**");
    let uid, beatmap, hash;
    if (args[1]) {
        uid = parseInt(args[0]);
        if (isNaN(uid)) return message.channel.send("❎ **| Hey, please enter a valid uid!**");
        if (args[1].startsWith("h:")) hash = args[1].split(":")[1];
        else beatmap = args[1]
    } else {
        uid = await fetchUid(maindb.collection('userbind'), {discordid: message.author.id});
        if (!uid) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
        if (args[0].startsWith("h:")) hash = args[0].split(":")[1];
        else beatmap = args[0];
        if (!beatmap && !hash) return message.channel.send("❎ **| Hey, please enter a valid beatmap link/ID or hash!**")
    }

    if (typeof beatmap === 'string') {
        const a = beatmap.split("/");
        beatmap = a[a.length - 1]
    }
    if (beatmap) beatmap = parseInt(beatmap);
    if (isNaN(beatmap) && !hash) return message.channel.send("❎ **| Hey, please enter a valid beatmap link or ID!**");

    let mapinfo;
    if (beatmap) {
        mapinfo = await new osudroid.MapInfo().get({beatmap_id: beatmap});
        if (mapinfo.error) return message.channel.send("❎ **| I'm sorry, I cannot fetch beatmap info from osu! API! Perhaps it is down?**");
        if (!mapinfo.title) return message.channel.send("❎ **| I'm sorry, I cannot find the beatmap that you are looking for!**");
        if (!mapinfo.objects) return message.channel.send("❎ **| I'm sorry, it seems like the beatmap has 0 objects!**");
        hash = mapinfo.hash
    }
    const play = await new osudroid.Score({uid: uid, hash: hash}).getFromHash();
    if (!play.score_id) return message.channel.send(`❎ **| I'm sorry, ${args[1] ? "that uid does" : "you do"} not have a score submitted on that beatmap!**`);
    if (!message.isOwner) cd.add(message.author.id);
    
    const replay = await new osudroid.ReplayAnalyzer({score_id: play.score_id}).analyze();
    const data = replay.data;
    const zip = new AdmZip();
    zip.addFile(`${play.score_id}.odr`, replay.original_odr);
    const object = {
        version: 1,
        replaydata: {
            filename: `${data.folder_name}\/${data.file_name}`,
            playername: data.player_name,
            replayfile: `${play.score_id}.odr`,
            mod: data.droid_mods,
            score: play.score,
            combo: play.combo,
            mark: play.rank,
            h300k: data.hit300k,
            h300: data.hit300,
            h100k: data.hit100k,
            h100: data.hit100,
            h50: data.hit50,
            misses: data.hit0,
            accuracy: data.accuracy,
            time: data.time.getTime(),
            perfect: data.is_full_combo
        }
    };
    zip.addFile("entry.json", Buffer.from(JSON.stringify(object, null, 2)));
    const attachment = new Discord.MessageAttachment(zip.toBuffer(), `${data.file_name.substring(0, data.file_name.length - 4)} [${data.player_name}]-${object.replaydata.time}.edr`);
    
    const hit_object_data = data.hit_object_data;
    let hit_error_total = 0;
    let count = 0;
    let _count = 0;
    let total = 0;
    let _total = 0;

    for (const hit_object of hit_object_data) {
        if (hit_object.result === 1) continue;
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
        if (hit_object.result !== 1) std_deviation += Math.pow(hit_object.accuracy - mean, 2);
    
    let unstable_rate = Math.sqrt(std_deviation / hit_object_data.length) * 10;
    let max_error = count ? total / count : 0;
    let min_error = _count ? _total / _count : 0;

    if (!beatmap) return message.channel.send(`✅ **| Successfully fetched replay.\n\nError: ${min_error.toFixed(2)}ms - +${max_error.toFixed(2)}ms avg\nUnstable Rate: ${unstable_rate.toFixed(2)}**`, {files: [attachment]});

    const star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: data.converted_mods});
	let starsline = parseFloat(star.droid_stars.total.toFixed(2));
	let pcstarsline = parseFloat(star.pc_stars.total.toFixed(2));
	let npp = osudroid.ppv2({
		stars: star.droid_stars,
		combo: play.combo,
		miss: play.miss,
		acc_percent: play.accuracy,
		mode: "droid"
	});
	let pcpp = osudroid.ppv2({
		stars: star.pc_stars,
		combo: play.combo,
		miss: play.miss,
		acc_percent: play.accuracy,
		mode: "osu"
	});
	let ppline = parseFloat(npp.total.toFixed(2));
	let pcppline = parseFloat(pcpp.total.toFixed(2));
    const footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);
    const embed = new Discord.MessageEmbed()
        .setFooter(`Achieved on ${play.date.toUTCString()} | Alice Synthesis Thirty`, footer[index])
        .setAuthor(`Play Information for ${play.player_name}`, "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg", `http://ops.dgsrz.com/profile.php?uid=${uid}`)
        .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}l.jpg`)
        .setColor(mapinfo.statusColor())
        .attachFiles([attachment])
		.setTitle(mapinfo.showStatistics(data.converted_mods, 0))
        .setDescription(mapinfo.showStatistics(data.converted_mods, 1))
		.setImage(`https://assets.ppy.sh/beatmaps/${mapinfo.beatmapset_id}/covers/cover.jpg`)
		.setURL(`https://osu.ppy.sh/b/${mapinfo.beatmap_id}`)
        .addField(mapinfo.showStatistics(data.converted_mods, 2), `${mapinfo.showStatistics(data.converted_mods, 3)}\n**Max score**: ${mapinfo.max_score(data.converted_mods).toLocaleString()}`)
        .addField(mapinfo.showStatistics(data.converted_mods, 4), `${mapinfo.showStatistics(data.converted_mods, 5)}\n**Result**: ${play.combo}/${mapinfo.max_combo}x / ${play.accuracy}% / [${data.hit300}/${data.hit100}/${data.hit50}/${data.hit0}]\n**Error**: ${min_error.toFixed(2)}ms - +${max_error.toFixed(2)}ms avg\n**Unstable Rate**: ${unstable_rate.toFixed(2)}`)
        .addField(`**Droid pp (Experimental)**: __${ppline} pp__ - ${starsline} stars`, `**PC pp**: ${pcppline} pp - ${pcstarsline} stars`);

    message.channel.send({embed: embed});

    if (!message.isOwner)
        setTimeout(() => {
            cd.delete(message.author.id)
        }, 60000)
};

module.exports.config = {
	name: "fetchreplay",
    description: "Fetches replay from a player or yourself on a beatmap.\n\nIf the second argument is omitted, your binded uid will be taken as the uid to fetch the replay from.",
	usage: "fetchreplay <beatmap/uid> [beatmap]",
	detail: "`beatmap`: The beatmap link, ID, or MD5 hash (prefix with `h:` if using hash) [Integer/String]\n`uid`: The uid of the player [Integer]",
	permission: "None"
};