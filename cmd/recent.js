const Discord = require('discord.js');
const config = require('../config.json');
const osudroid = require('../modules/osu!droid');

module.exports.run = (client, message, args, maindb, alicedb, current_map) => {
	let uid = parseInt(args[0]);
	if (isNaN(uid)) return message.channel.send("❎ **| Hey, can you at least give me a valid uid?**");
	new osudroid.PlayerInfo().get({uid: uid}, player => {
		if (!player.name) return message.channel.send("❎ **| I'm sorry, I cannot find the player!**");
		if (!player.recent_plays) return message.channel.send("❎ **| I'm sorry, this player hasn't submitted any play!**");
		let rplay = player.recent_plays[0];
		let score = rplay.score.toLocaleString();
		let name = player.name;
		let title = rplay.filename;
		let rank = osudroid.rankImage.get(rplay.mark);
		let combo = rplay.combo;
		let ptime = new Date(rplay.date * 1000);
		ptime.setUTCHours(ptime.getUTCHours() + 7);
		let acc = parseFloat((rplay.accuracy / 1000).toFixed(2));
		let miss = rplay.miss;
		let mod = rplay.mode;
		let mod_string = osudroid.mods.droid_to_PC(mod, true);
		let hash = rplay.hash;
		let footer = config.avatar_list;
		const index = Math.floor(Math.random() * footer.length);
		let embed = {
			"title": title,
			"description": "**Score**: `" + score + "` - Combo: `" + combo + "x` - Accuracy: `" + acc + "%`\n(`" + miss + "` x)\nMod: `" + mod_string + "`\nTime: `" + ptime.toUTCString() + "`",
			"color": 8311585,
			"author": {
				"name": "Recent Play for " + name,
				"icon_url": rank
			},
			"footer": {
				"icon_url": footer[index],
				"text": "Alice Synthesis Thirty"
			}
		};
		message.channel.send({embed: embed}).catch(console.error);

		let time = Date.now();
		let entry = [time, message.channel.id, hash];
		let found = false;
		for (let i = 0; i < current_map.length; i++) {
			if (current_map[i][1] != message.channel.id) continue;
			current_map[i] = entry;
			found = true;
			break
		}
		if (!found) current_map.push(entry);

		new osudroid.MapInfo().get({hash: hash}, mapinfo => {
			if (!mapinfo.title || !mapinfo.objects) return;
			mod = osudroid.mods.droid_to_PC(mod);
			let star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: mod});
			let droid_stars = parseFloat(star.droid_stars.toString().split(" ")[0]);
			let pc_stars = parseFloat(star.pc_stars.toString().split(" ")[0]);
			let npp = osudroid.ppv2({
				stars: star.droid_stars,
				combo: combo,
				acc_percent: acc,
				miss: miss,
				mode: "droid"
			});
			let pcpp = osudroid.ppv2({
				stars: star.pc_stars,
				combo: combo,
				acc_percent: acc,
				miss: miss,
				mode: "osu"
			});
			let dpp = parseFloat(npp.toString().split(" ")[0]);
			let pp = parseFloat(pcpp.toString().split(" ")[0]);

			embed = new Discord.MessageEmbed()
				.setFooter("Alice Synthesis Thirty", footer[index])
				.setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}.jpg`)
				.setColor(mapinfo.statusColor(mapinfo.approved))
				.setAuthor("Map Found", "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg")
				.setTitle(mapinfo.showStatistics(mod, 0))
				.setURL(`https://osu.ppy.sh/b/${mapinfo.beatmap_id}`)
				.setDescription(mapinfo.showStatistics(mod, 1))
				.addField(mapinfo.showStatistics(mod, 2), mapinfo.showStatistics(mod, 3))
				.addField(mapinfo.showStatistics(mod, 4), mapinfo.showStatistics(mod, 5))
				.addField(`**Droid pp (Experimental)**: __${dpp} pp__ - ${droid_stars} stars`, `**PC pp**: ${pp} pp - ${pc_stars} stars`);

			message.channel.send({embed: embed}).catch(console.error)
		})
	})
};

module.exports.config = {
	name: "recent",
	description: "Retrieves an osu!droid account's recent play based on uid.",
	usage: "recent <uid>",
	detail: "`uid`: The uid to retrieve [Integer]",
	permission: "None"
};
