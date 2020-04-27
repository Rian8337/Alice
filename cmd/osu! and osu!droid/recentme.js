const Discord = require('discord.js');
const osudroid = require('osu-droid');
const config = require('../../config.json');

module.exports.run = (client, message, args, maindb, alicedb, current_map) => {
	let ufind = message.author.id;
	if (args[0]) {
		ufind = args[0];
		ufind = ufind.replace('<@!','');
		ufind = ufind.replace('<@','');
		ufind = ufind.replace('>','');
	}
	let binddb = maindb.collection("userbind");
	let query = { discordid: ufind };
	binddb.findOne(query, async function(err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("Error: Empty database response. Please try again!")
		}
		if (!res) return message.channel.send("❎ **| I'm sorry, the account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**")
		let uid = res.uid;
		const player = await new osudroid.PlayerInfo().get({uid: uid});
		if (!player.name) return message.channel.send("❎ **| I'm sorry, I cannot find the player!**");
		if (player.recent_plays.length === 0) return message.channel.send("❎ **| I'm sorry, this player hasn't submitted any play!**");
		let rplay = player.recent_plays[0];
		let score = rplay.score.toLocaleString();
		let name = player.name;
		let title = rplay.title;
		let rank = osudroid.rankImage.get(rplay.rank);
		let combo = rplay.combo;
		let ptime = rplay.date;
		let acc = rplay.accuracy;
		let miss = rplay.miss;
		let mod = rplay.mods;
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

		let entry = [message.channel.id, hash];
		let map_index = current_map.findIndex(map => map[0] === message.channel.id);
		if (map_index === -1) current_map.push(entry);
		else current_map[map_index][1] = hash;

		const mapinfo = await new osudroid.MapInfo().get({hash: hash});
		if (!mapinfo.title || !mapinfo.objects || !mapinfo.osu_file) return;
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
			.setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}l.jpg`)
			.setColor(mapinfo.statusColor(mapinfo.approved))
			.setAuthor("Map Found", "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg")
			.setTitle(mapinfo.showStatistics(mod, 0))
			.setURL(`https://osu.ppy.sh/b/${mapinfo.beatmap_id}`)
			.setDescription(mapinfo.showStatistics(mod, 1))
			.addField(mapinfo.showStatistics(mod, 2), mapinfo.showStatistics(mod, 3))
			.addField(mapinfo.showStatistics(mod, 4), mapinfo.showStatistics(mod, 5));

		if (miss > 0 || combo < mapinfo.max_combo) {
			let if_fc_acc = new osudroid.Accuracy({
				n300: npp.computed_accuracy.n300,
				n100: npp.computed_accuracy.n100,
				n50: npp.computed_accuracy.n50,
				nmiss: 0,
				nobjects: mapinfo.objects
			}).value() * 100;
			let if_fc_dpp = osudroid.ppv2({
				stars: star.droid_stars,
				combo: mapinfo.max_combo,
				acc_percent: if_fc_acc,
				miss: 0,
				mode: "droid"
			});
			let if_fc_pp = osudroid.ppv2({
				stars: star.pc_stars,
				combo: mapinfo.max_combo,
				acc_percent: if_fc_acc,
				miss: 0,
				mode: "osu"
			});
			let dline = parseFloat(if_fc_dpp.toString().split(" ")[0]);
			let pline = parseFloat(if_fc_pp.toString().split(" ")[0]);
			embed.addField(`**Droid pp (Experimental)**: __${dpp} pp__ - ${droid_stars} stars\n**Droid pp (if FC)**: __${dline} pp__ **(${if_fc_acc.toFixed(2)}%)**`, `**PC pp**: ${pp} pp - ${pc_stars} stars\n**PC pp (if FC)**: ${pline} pp **(${if_fc_acc.toFixed(2)}%)**`)
		} else embed.addField(`**Droid pp (Experimental)**: __${dpp} pp__ - ${droid_stars} stars`, `**PC pp**: ${pp} pp - ${pc_stars} stars`);

		message.channel.send({embed: embed}).catch(console.error)
	})
};

module.exports.config = {
	name: "recentme",
	description: "Retrieves a user's most recent play (detailed).",
	usage: "recentme [user]",
	detail: "`user`: The user to retrieve [UserResolvable (mention or user ID)]",
	permission: "None"
};