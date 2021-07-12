const Discord = require('discord.js');
const config = require('../config.json');
const osudroid = require('osu-droid');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {[string, string][]} current_map
 * @param {boolean} mapset 
 * @param {boolean} calculate
 */
module.exports.run = async (client, message, args, current_map, mapset = false, calculate = false) => {
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
	const a = args[0].split("/");
	const beatmapid = parseInt(a[a.length-1]);
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
			if (!isNaN(new_missc)) {
				missc = Math.max(0, new_missc);
			}
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

	const isEstimatedValue = count50 + count100 === 0;
	const stats = new osudroid.MapStats();
	if (speedMultiplier >= 0.5) {
		stats.speedMultiplier = speedMultiplier;
	}
	if (forceAR >= 0) {
		stats.ar = forceAR;
		stats.isForceAR = true;
	}

	if (mapset) {
		if (!calculate) {
			return;
		}
		const apiRequestBuilder = new osudroid.OsuAPIRequestBuilder()
			.setEndpoint("get_beatmaps")
			.addParameter("s", beatmapid);

		const result = await apiRequestBuilder.sendRequest();
		if (result.statusCode !== 200) {
			return;
		}

		let obj = JSON.parse(result.data.toString("utf-8"));
		if (!obj || !obj[0]) {
			return console.log("Map not found");
		}
		let i = 0;
		const map_entries = [];
		obj = obj.filter(map => map.mode === "0");
		obj.sort((a, b) => {return parseFloat(b.difficultyrating) - parseFloat(a.difficultyrating);});
		const total_map = obj.length;
		if (obj.length > 3) {
			obj.splice(3);
		}

		obj.forEach(async map => {
			const mapinfo = await new osudroid.MapInfo().fillMetadata(map).retrieveBeatmapFile();
			i++;
			if (!mapinfo.osuFile) {
				return;
			}
			let realAcc = new osudroid.Accuracy({
				percent: acc,
				nobjects: mapinfo.objects,
				nmiss: missc
			});
			if (acc === 100 && missc > 0 && !count50 && !count100) {
				acc_estimation = true;
				realAcc = new osudroid.Accuracy({
					n300: mapinfo.objects - missc,
					n100: 0,
					n50: 0,
					nmiss: missc
				});
			}
			if (count50 || count100) {
				realAcc = new osudroid.Accuracy({
					n300: mapinfo.objects - count50 - count100 - missc,
					n100: count100,
					n50: count50,
					nmiss: missc
				});
			}

			if (!combo || combo <= 0) combo = mapinfo.maxCombo - missc;
			if (mapinfo.maxCombo <= missc) {
				return;
			}

			const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mod, stats});
			const starsline = parseFloat(star.droidStars.toString().split(" ")[0]);
			const pcstarsline = parseFloat(star.pcStars.toString().split(" ")[0]);
			const npp = new osudroid.DroidPerformanceCalculator().calculate({
				stars: star.droidStars,
				combo: combo,
				accPercent: realAcc,
				stats
			});
			const pcpp = new osudroid.OsuPerformanceCalculator().calculate({
				stars: star.pcStars,
				combo: combo,
				accPercent: realAcc,
				stats
			});
			const ppline = parseFloat(npp.toString().split(" ")[0]);
			const pcppline = parseFloat(pcpp.toString().split(" ")[0]);
			const entry = [mapinfo, starsline, pcstarsline, mapinfo.maxScore({mods: mod}), ppline.toFixed(2), pcppline.toFixed(2)];
			map_entries.push(entry);
			if (i === obj.length) {
				map_entries.sort((a, b) => {return b[2] - a[2];});
				const footer = config.avatar_list;
				const index = Math.floor(Math.random() * footer.length);
				const embed = new Discord.MessageEmbed()
					.setFooter("Alice Synthesis Thirty", footer[index])
					.setTitle(`${mapinfo.artist} - ${mapinfo.title} by ${mapinfo.creator}`)
					.setAuthor("Map Found", "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg")
					.setColor(mapinfo.statusColor())
					.setURL(`https://osu.ppy.sh/s/${mapinfo.beatmapsetID}`)
					.setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapsetID}.jpg`)
					.setDescription(`${mapinfo.showStatistics(mod, 1, stats)}\n**BPM**: ${mapinfo.convertBPM(stats)} - **Length**: ${mapinfo.convertTime(stats)}`);

				for (i = 0; i < map_entries.length; i++) {
					const star_rating = map_entries[i][2];
					let diff_icon = '';
					switch (true) {
						case star_rating < 2: diff_icon = client.emojis.cache.get("679325905365237791"); break; // Easy
						case star_rating < 2.7: diff_icon = client.emojis.cache.get("679325905734205470"); break; // Normal
						case star_rating < 4: diff_icon = client.emojis.cache.get("679325905658708010"); break; // Hard
						case star_rating < 5.3: diff_icon = client.emojis.cache.get("679325905616896048"); break; // Insane
						case star_rating < 6.5: diff_icon = client.emojis.cache.get("679325905641930762"); break; // Expert
						default: diff_icon = client.emojis.cache.get("679325905645993984") // Extreme
					}
					const description = `${map_entries[i][0].showStatistics(mod, 2, stats)}\n**Max score**: ${map_entries[i][3].toLocaleString()} - **Max combo**: ${map_entries[i][0].maxCombo}x\n\`${map_entries[i][1]} droid stars - ${map_entries[i][2]} PC stars\`\n**${map_entries[i][4]}**dpp - ${map_entries[i][5]}pp${isEstimatedValue && acc !== 100 ? " (estimated)" : ""}`;
					embed.addField(`${diff_icon} __${map_entries[i][0].version}__`, description);
				}

				message.channel.send(total_map > 3 ? `✅ **| I found ${total_map} maps, but only displaying 3 due to my limitations.**` : "", {embed: embed});
			}
		});
		return;
	}
	const mapinfo = await osudroid.MapInfo.getInformation({beatmapID: beatmapid});
	const map_index = current_map.findIndex(map => map[0] === message.channel.id);
	if (map_index === -1) {
		current_map.push([message.channel.id, mapinfo.hash]);
	} else {
		current_map[map_index][1] = mapinfo.hash;
	}

	if (!calculate || !mapinfo.title || !mapinfo.objects || !mapinfo.osuFile) {
		return;
	}
	if (!combo) {
		combo = mapinfo.maxCombo - missc;
	}
	if (mapinfo.maxCombo <= missc) {
		return;
	}
	let realAcc = new osudroid.Accuracy({
		percent: acc,
		nobjects: mapinfo.objects,
		nmiss: missc
	});
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

	const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mod, stats});
	const starsline = parseFloat(star.droidStars.toString().split(" ")[0]);
	const pcstarsline = parseFloat(star.pcStars.toString().split(" ")[0]);
	const npp = new osudroid.DroidPerformanceCalculator().calculate({
		stars: star.droidStars,
		combo: combo,
		accPercent: realAcc,
		stats
	});
	const pcpp = new osudroid.OsuPerformanceCalculator().calculate({
		stars: star.pcStars,
		combo: combo,
		accPercent: realAcc,
		stats
	});
	const ppline = parseFloat(npp.toString().split(" ")[0]);
	const pcppline = parseFloat(pcpp.toString().split(" ")[0]);

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
		.addField(mapinfo.showStatistics(mod, 2, stats), mapinfo.showStatistics(mod, 3, stats))
		.addField(mapinfo.showStatistics(mod, 4, stats), `${mapinfo.showStatistics(mod, 5, stats)}\n**Result**: ${combo}/${mapinfo.maxCombo}x / ${(realAcc.value() * 100).toFixed(2)}% / [${realAcc.n300}/${realAcc.n100}/${realAcc.n50}/${realAcc.nmiss}]`)
		.addField(`**Droid pp (Experimental)**: __${ppline} pp__${isEstimatedValue && acc !== 100 ? " (estimated)" : ""} - ${starsline} stars`, `**PC pp**: ${pcppline} pp${isEstimatedValue && acc !== 100 ? " (estimated)" : ""} - ${pcstarsline} stars`);

	const graph = await star.pcStars.getStrainChart(mapinfo.beatmapsetID, message.member?.displayHexColor || "#000000");

	if (graph) {
		embed.attachFiles([new Discord.MessageAttachment(graph, "chart.png")])
			.setImage("attachment://chart.png");
	}

	let string = '';
	if (ndetail) {
		string += `Raw droid stars: ${star.droidStars.toString()}\nRaw droid pp: ${npp.toString()}\n`;
	}
	if (pcdetail) {
		string += `Raw PC stars: ${star.pcStars.toString()}\nRaw PC pp: ${pcpp.toString()}`;
	}
	message.channel.send(string, {embed: embed}).catch(console.error);
};

module.exports.config = {
	name: "autocalc"
};	