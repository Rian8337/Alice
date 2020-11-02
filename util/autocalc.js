const Discord = require('discord.js');
const https = require('https');
const apikey = process.env.OSU_API_KEY;
const config = require('../config.json');
const osudroid = require('osu-droid');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {[string, string][]} current_map 
 * @param {boolean} mapset 
 */
module.exports.run = async (client, message, args, current_map, mapset = false) => {
	let beatmapid;
	let combo;
	let acc = 100;
	let missc = 0;
	let mod = '';
	let ndetail = false;
	let pcdetail = false;
	let speedMultiplier = -1;
	let forceAR = -1;
	let a = args[0].split("/");
	beatmapid = a[a.length-1];
	for (let i = 1; i < args.length; i++) {
		if (args[i].endsWith("%")) {
			const new_acc = parseFloat(args[i]);
			if (!isNaN(new_acc)) acc = Math.max(0, Math.min(new_acc, 100));
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
				if (!isNaN(new_combo)) combo = Math.max(0, new_combo);
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
	}

	const stats = new osudroid.MapStats();
	if (speedMultiplier >= 0.5) {
		stats.speedMultiplier = speedMultiplier;
	}
	if (forceAR >= 0) {
		stats.ar = forceAR;
		stats.isForceAR = true;
	}

	if (mapset) {
		let options = new URL(`https://osu.ppy.sh/api/get_beatmaps?k=${apikey}&s=${beatmapid}`);
		let content = '';
		let req = https.get(options, res => {
			res.setEncoding("utf8");
			res.setTimeout(10000);
			res.on("data", chunk => {
				content += chunk
			});
			res.on("error", err => {
				console.log("Error retrieving map info");
				return console.log(err)
			});
			res.on("end", () => {
				let obj;
				try {
					obj = JSON.parse(content);
				} catch (e) {
					console.log("Error retrieving map info");
					return console.log(e);
				}
				if (!obj || !obj[0]) return console.log("Map not found");
				let i = 0;
				let map_entries = [];
				obj = obj.filter(map => map.mode === "0");
				obj.sort((a, b) => {
					return parseFloat(b.difficultyrating) - parseFloat(a.difficultyrating);
				});
				let total_map = obj.length;
				if (obj.length > 3) obj.splice(3);

				obj.forEach(async map => {
					const mapinfo = new osudroid.MapInfo();
					mapinfo.fillMetadata(map);
					await mapinfo.retrieveBeatmapFile();
					i++;
					if (!mapinfo.osuFile) {
						return;
					}
					if (!combo || combo <= 0) {
						combo = mapinfo.maxCombo - missc;
					}
					if (mapinfo.maxCombo <= missc) {
						return;
					}
					combo = Math.min(combo, mapinfo.maxCombo);
					
					let star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mod, stats: stats});
					let starsline = parseFloat(star.droidStars.total.toFixed(2));
					let pcstarsline = parseFloat(star.pcStars.total.toFixed(2));
					let npp = new osudroid.PerformanceCalculator().calculate({
						stars: star.droidStars,
						combo: combo,
						accPercent: acc,
						miss: missc,
						mode: osudroid.modes.droid,
						stats: stats
					});
					let pcpp = new osudroid.PerformanceCalculator().calculate({
						stars: star.pcStars,
						combo: combo,
						accPercent: acc,
						miss: missc,
						mode: osudroid.modes.osu,
						stats: stats
					});
					let ppline = parseFloat(npp.total.toFixed(2));
					let pcppline = parseFloat(pcpp.total.toFixed(2));
					let entry = [mapinfo, starsline, pcstarsline, mapinfo.maxScore(stats), ppline, pcppline];
					map_entries.push(entry);
					if (i === obj.length) {
						map_entries.sort((a, b) => {return b[2] - a[2];});
						let footer = config.avatar_list;
						const index = Math.floor(Math.random() * footer.length);
						let embed = new Discord.MessageEmbed()
							.setFooter("Alice Synthesis Thirty", footer[index])
							.setTitle(`${mapinfo.artist} - ${mapinfo.title} by ${mapinfo.creator}`)
							.setAuthor("Map Found", "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg")
							.setColor(mapinfo.statusColor())
							.setURL(`https://osu.ppy.sh/s/${mapinfo.beatmapsetID}`)
							.setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapsetID}.jpg`)
							.setDescription(`${mapinfo.showStatistics(mod, 1, stats)}\n**BPM**: ${mapinfo.convertBPM(stats)} - **Length**: ${mapinfo.convertTime(stats)}`);

						for (i = 0; i < map_entries.length; i++) {
							let star_rating = map_entries[i][2];
							let diff_icon = '';
							switch (true) {
								case star_rating < 2: diff_icon = client.emojis.cache.get("679325905365237791"); break; // Easy
								case star_rating < 2.7: diff_icon = client.emojis.cache.get("679325905734205470"); break; // Normal
								case star_rating < 4: diff_icon = client.emojis.cache.get("679325905658708010"); break; // Hard
								case star_rating < 5.3: diff_icon = client.emojis.cache.get("679325905616896048"); break; // Insane
								case star_rating < 6.5: diff_icon = client.emojis.cache.get("679325905641930762"); break; // Expert
								default: diff_icon = client.emojis.cache.get("679325905645993984"); // Extreme
							}
							let description = `${map_entries[i][0].showStatistics(mod, 2, stats)}\n**Max score**: ${map_entries[i][3].toLocaleString()} - **Max combo**: ${map_entries[i][0].maxCombo}x\n\`${map_entries[i][1]} droid stars - ${map_entries[i][2]} PC stars\`\n**${map_entries[i][4]}**dpp - ${map_entries[i][5]}pp`;
							embed.addField(`${diff_icon} __${map_entries[i][0].version}__`, description);
						}

						message.channel.send(total_map > 3 ? `✅ **| I found ${total_map} maps, but only displaying 3 due to my limitations.**` : "", {embed: embed});
					}
				});
			});
		});
		return req.end();
	}
	const mapinfo = await osudroid.MapInfo.getInformation({beatmapID: beatmapid});

	if (!mapinfo.title || !mapinfo.objects || !mapinfo.osuFile) {
		return;
	}
	if (!combo) {
		combo = mapinfo.maxCombo - missc;
	}
	if (mapinfo.maxCombo <= missc) {
		return;
	}
	combo = Math.min(combo, mapinfo.maxCombo);
	let acc_estimation = false;
	if (acc === 100 && missc > 0) {
		acc_estimation = true;
		const real_acc = new osudroid.Accuracy({
			n300: mapinfo.objects - missc,
			n100: 0,
			n50: 0,
			nmiss: missc,
			nobjects: mapinfo.objects
		}).value() * 100;
		acc = parseFloat(real_acc.toFixed(2));
	}

	let star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mod, stats: stats});
	let starsline = parseFloat(star.droidStars.total.toFixed(2));
	let pcstarsline = parseFloat(star.pcStars.total.toFixed(2));
	let npp = new osudroid.PerformanceCalculator().calculate({
		stars: star.droidStars,
		combo: combo,
		accPercent: acc,
		miss: missc,
		mode: osudroid.modes.droid,
		stats: stats
	});
	let pcpp = new osudroid.PerformanceCalculator().calculate({
		stars: star.pcStars,
		combo: combo,
		accPercent: acc,
		miss: missc,
		mode: osudroid.modes.osu,
		stats: stats
	});
	let ppline = parseFloat(npp.total.toFixed(2));
	let pcppline = parseFloat(pcpp.total.toFixed(2));

	let footer = config.avatar_list;
	const index = Math.floor(Math.random() * footer.length);
	let embed = new Discord.MessageEmbed()
		.setFooter("Alice Synthesis Thirty", footer[index])
		.setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapsetID}l.jpg`)
		.setColor(mapinfo.statusColor())
		.setAuthor("Map Found", "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg")
		.setTitle(mapinfo.showStatistics(mod, 0, stats))
		.setDescription(mapinfo.showStatistics(mod, 1, stats))
		.setURL(`https://osu.ppy.sh/b/${mapinfo.beatmapID}`)
		.addField(mapinfo.showStatistics(mod, 2, stats), mapinfo.showStatistics(mod, 3, stats))
		.addField(mapinfo.showStatistics(mod, 4, stats), `${mapinfo.showStatistics(mod, 5, stats)}\n**Result**: ${combo}/${mapinfo.maxCombo}x / ${acc}%${acc_estimation ? " (estimated)" : ""} / ${missc} miss(es)`)
		.addField(`**Droid pp (Experimental)**: __${ppline} pp__ - ${starsline} stars`, `**PC pp**: ${pcppline} pp - ${pcstarsline} stars`);

	let string = '';
	if (ndetail) string += `Raw droid pp: ${npp.toString()}\n`;
	if (pcdetail) string += `Raw PC pp: ${pcpp.toString()}`;
	message.channel.send(string, {embed: embed}).catch(console.error);

	let map_index = current_map.findIndex(map => map[0] === message.channel.id);
	if (map_index === -1) current_map.push([message.channel.id, mapinfo.hash]);
	else current_map[map_index][1] = mapinfo.hash;
};

module.exports.config = {
	name: "autocalc",
	description: "Automatically calculates pp for an osu!standard map.",
	usage: "None",
	detail: "None",
	permission: "None"
};
