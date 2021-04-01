const Discord = require('discord.js');
const osudroid = require('osu-droid');
const config = require('../../config.json');
const { Db } = require('mongodb');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 * @param {[string, string][]} current_map 
 */
module.exports.run = async (client, message, args, maindb, alicedb, current_map) => {
	let beatmapid;
	let combo;
	let acc = 100;
	let missc = 0;
	let mod = '';
	let ndetail = false;
	let pcdetail = false;
	let speedMultiplier = -1;
	let forceAR = -1;
	let count50 = 0;
	let count100 = 0;
	if (!args[0]) {
		return message.channel.send("❎ **| Hey, how am I supposed to calculate when I don't know what to calculate?**");
	}
	let a = args[0].split("/");
	beatmapid = parseInt(a[a.length-1]);
	if (isNaN(beatmapid)) {
		return;
	}
	for (let i = 1; i < args.length; i++) {
		if (args[i].endsWith("%")) {
			const new_acc = parseFloat(args[i]);
			if (!isNaN(new_acc)) {
				acc = Math.max(0, Math.min(new_acc, 100));
			}
		}
		if (args[i].endsWith("m")) {
			const new_missc = parseInt(args[i]);
			if (!isNaN(new_missc)) missc = Math.max(0, new_missc);
		}
		if (args[i].endsWith("x")) {
			if (args[i].includes(".")) {
				speedMultiplier = Math.max(0.5, Math.min(2, parseFloat(parseFloat(args[i]).toFixed(2))));
			} else {
				const new_combo = parseInt(args[i]);
				if (!isNaN(new_combo)) {
					combo = Math.max(0, new_combo);
				}
			}
		}
		if (args[i].startsWith("+")) {
			mod = args[i].replace("+", "").toUpperCase();
		}
		if (args[i].startsWith("-d")) {
			ndetail = true;
		}
		if (args[i].startsWith("-p")) {
			pcdetail = true;
		}
		if (args[i].startsWith("AR")) {
			forceAR = Math.max(0, Math.min(12.5, parseFloat(parseFloat(args[i].substring(2)).toFixed(2))));
		}
		if (args[i].endsWith("x50")) {
			count50 = Math.max(0, parseInt(args[i]) || 0);
		}
		if (args[i].endsWith("x100")) {
			count100 = Math.max(0, parseInt(args[i]) || 0);
		}
	}

	const mapinfo = await osudroid.MapInfo.getInformation({beatmapID: beatmapid});
	if (mapinfo.error) {
		return message.channel.send("❎ **| I'm sorry, I cannot fetch beatmap info from osu! API! Perhaps it is down?**");
	}
	if (!mapinfo.title) {
		return message.channel.send("❎ **| I'm sorry, I cannot find the map that you are looking for!**");
	}
	if (!mapinfo.objects) {
		return message.channel.send("❎ **| I'm sorry, it seems like the map has 0 objects!**");
	}
	if (!mapinfo.osuFile) {
		return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! servers. Please try again!**");
	}
	if (!combo) {
		combo = mapinfo.maxCombo - missc;
	}
	if (combo <= 0) {
		return message.channel.send("❎ **| Hey, the specified miss count is more than or equal to the specified combo or the beatmap's maximum combo!**");
	}
	combo = Math.min(combo, mapinfo.maxCombo);
	let acc_estimation = false;
	let realAcc = new osudroid.Accuracy({
		percent: acc,
		nobjects: mapinfo.objects,
		nmiss: missc
	});
	const isEstimatedValue = count50 + count100 === 0;
	if (acc === 100 && missc > 0 && isEstimatedValue) {
		acc_estimation = true;
		realAcc = new osudroid.Accuracy({
			n300: mapinfo.objects - missc,
			n100: 0,
			n50: 0,
			nmiss: missc
		});
	}

	if (!isEstimatedValue) {
		realAcc = new osudroid.Accuracy({
			n300: mapinfo.objects - count50 - count100 - missc,
			n100: count100,
			n50: count50,
			nmiss: missc
		});
	}

	const stats = new osudroid.MapStats();
	if (speedMultiplier >= 0.5) {
		stats.speedMultiplier = speedMultiplier;
	}
	if (forceAR >= 0) {
		stats.ar = forceAR;
		stats.isForceAR = true;
	}

	const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mod, stats});
	const starsline = parseFloat(star.droidStars.total.toFixed(2));
	const pcstarsline = parseFloat(star.pcStars.total.toFixed(2));
	const npp = new osudroid.PerformanceCalculator().calculate({
		stars: star.droidStars,
		combo: combo,
		accPercent: realAcc,
		mode: osudroid.modes.droid,
		stats: stats
	});
	const pcpp = new osudroid.PerformanceCalculator().calculate({
		stars: star.pcStars,
		combo: combo,
		accPercent: realAcc,
		mode: osudroid.modes.osu,
		stats: stats
	});
	const ppline = parseFloat(npp.total.toFixed(2));
	const pcppline = parseFloat(pcpp.total.toFixed(2));
	const footer = config.avatar_list;
	const index = Math.floor(Math.random() * footer.length);
	const embed = new Discord.MessageEmbed()
		.setFooter("Alice Synthesis Thirty", footer[index])
		.setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapsetID}l.jpg`)
		.setColor(mapinfo.statusColor())
		.setAuthor("Map Found", "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg")
		.setTitle(mapinfo.showStatistics(mod, 0, stats))
		.setDescription(mapinfo.showStatistics(mod, 1, stats))
		.setURL(`https://osu.ppy.sh/b/${mapinfo.beatmapID}`)
		.attachFiles([new Discord.MessageAttachment(await star.pcStars.getStrainChart(mapinfo.beatmapsetID, message.member?.displayHexColor || "#000000"), "chart.png")])
		.setImage("attachment://chart.png")
		.addField(mapinfo.showStatistics(mod, 2, stats), mapinfo.showStatistics(mod, 3, stats))
		.addField(mapinfo.showStatistics(mod, 4, stats), `${mapinfo.showStatistics(mod, 5, stats)}\n**Result**: ${combo}/${mapinfo.maxCombo}x / ${(realAcc.value(mapinfo.objects) * 100).toFixed(2)}%${acc_estimation ? " (estimated)" : ""} / [${realAcc.n300}/${realAcc.n100}/${realAcc.n50}/${realAcc.nmiss}]`)
		.addField(`**Droid pp (Experimental)**: __${ppline} pp__${isEstimatedValue && acc !== 100 ? " (estimated)" : ""} - ${starsline} stars`, `**PC pp**: ${pcppline} pp${isEstimatedValue && acc !== 100 ? " (estimated)" : ""} - ${pcstarsline} stars`);

	let string = '';
	if (ndetail) {
		string += `Raw droid stars: ${star.droidStars.toString()}\nRaw droid pp: ${npp.toString()}\n`;
	}
	if (pcdetail) {
		string += `Raw PC stars: ${star.pcStars.toString()}\nRaw PC pp: ${pcpp.toString()}`;
	}
	message.channel.send(string, {embed: embed}).catch(console.error);

	const map_index = current_map.findIndex(map => map[0] === message.channel.id);
	if (map_index === -1) current_map.push([message.channel.id, mapinfo.hash]);
	else current_map[map_index][1] = mapinfo.hash;
};

module.exports.config = {
	name: "manualcalc",
	description: "Calculates the performance points of an osu!standard map.",
	usage: "manualcalc <map link / map ID> [(+<mod>) (<combo>x) (<acc>%) (<x100>x100) (<x50>x50) (<miss>m) (AR<ar>) (<speed>x) (-d) (-p)]",
	detail: "`map link/map ID`: The link or beatmap ID of the map [String/Integer]\n`mod`: Applied game modifications (HD, HR, etc) [String]\n`combo`: Max combo reached [Integer]\n`acc`: Accuracy gained [Decimal]\n`miss`: Amount of misses [Integer]\n`ar`: The AR to be forced into calculation [Decimal]\n`speed`: The speed multiplier to calculate for, ranging from 0.5x to 2x. Note that a dot must be put to differentiate it with combo (for example `1.0x`) [Decimal]\n`-d`: Gives detailed response of droid pp\n`-p`: Gives detailed response of pp\n`x50`: The amount of 50s achieved. If specified, will override accuracy [Integer]\n`x100`: The amount of 100s achieved. If specified, will override accuracy [Integer]",
	permission: "None"
};