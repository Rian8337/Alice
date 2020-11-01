const Discord = require('discord.js');
const config = require('../../config.json');
const osudroid = require('osu-droid');

module.exports.run = async (client, message, args, maindb, alicedb, current_map) => {
	let uid = parseInt(args[0]);
	if (isNaN(uid)) return message.channel.send("❎ **| Hey, can you at least give me a valid uid?**");
	const player = await osudroid.Player.getInformation({uid: uid});
	if (player.error) return message.channel.send("❎ **| I'm sorry, I couldn't fetch the user's profile! Perhaps osu!droid server is down?**");
	if (!player.username) return message.channel.send("❎ **| I'm sorry, I couldn't find the user's profile!**");
	if (player.recentPlays.length === 0) return message.channel.send("❎ **| I'm sorry, this player hasn't submitted any play!**");
	let rplay = player.recentPlays[0];
	let score = rplay.score.toLocaleString();
	let name = player.username;
	let title = rplay.title;
	let rank = osudroid.rankImage.get(rplay.rank);
	let combo = rplay.combo;
	let ptime = rplay.date;
	let acc = rplay.accuracy;
	let miss = rplay.miss;
	let mod = rplay.mods;
	let mod_string = osudroid.mods.pcToDetail(mod);
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

	const mapinfo = await osudroid.MapInfo.getInformation({hash: hash});
	if (mapinfo.error || !mapinfo.title || !mapinfo.objects || !mapinfo.osuFile) return;
	let star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mod});
	let droidStars = parseFloat(star.droidStars.total.toFixed(2));
	let pc_stars = parseFloat(star.pcStars.total.toFixed(2));
	let npp = new osudroid.PerformanceCalculator().calculate({
        stars: star.droidStars,
        combo: combo,
        accPercent: acc,
        miss: miss,
        mode: osudroid.modes.droid
    });
	let pcpp = new osudroid.PerformanceCalculator().calculate({
        stars: star.pcStars,
        combo: combo,
        accPercent: acc,
        miss: miss,
        mode: osudroid.modes.osu
    });
	let dpp = parseFloat(npp.total.toFixed(2));
	let pp = parseFloat(pcpp.total.toFixed(2));

	embed = new Discord.MessageEmbed()
		.setFooter("Alice Synthesis Thirty", footer[index])
		.setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapsetID}l.jpg`)
		.setColor(mapinfo.statusColor())
		.setAuthor("Map Found", "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg")
		.setTitle(mapinfo.showStatistics(mod, 0))
		.setURL(`https://osu.ppy.sh/b/${mapinfo.beatmapID}`)
		.setDescription(mapinfo.showStatistics(mod, 1))
		.addField(mapinfo.showStatistics(mod, 2), mapinfo.showStatistics(mod, 3))
		.addField(mapinfo.showStatistics(mod, 4), mapinfo.showStatistics(mod, 5));

	if (miss > 0 || combo < mapinfo.maxCombo) {
		let if_fc_acc = new osudroid.Accuracy({
			n300: npp.computedAccuracy.n300 + miss,
			n100: npp.computedAccuracy.n100,
			n50: npp.computedAccuracy.n50,
			nmiss: 0,
			nobjects: mapinfo.objects
		}).value() * 100;
		let if_fc_dpp = new osudroid.PerformanceCalculator().calculate({
			stars: star.droidStars,
			combo: mapinfo.maxCombo,
			accPercent: if_fc_acc,
			miss: 0,
			mode: osudroid.modes.droid
		});
		let if_fc_pp = new osudroid.PerformanceCalculator().calculate({
			stars: star.pcStars,
			combo: mapinfo.maxCombo,
			accPercent: if_fc_acc,
			miss: 0,
			mode: osudroid.modes.osu
		});
		let dline = parseFloat(if_fc_dpp.total.toFixed(2));
		let pline = parseFloat(if_fc_pp.total.toFixed(2));
		embed.addField(`**Droid pp (Experimental)**: __${dpp} pp__ - ${droidStars} stars\n**Droid pp (if FC)**: __${dline} pp__ **(${if_fc_acc.toFixed(2)}%)**`, `**PC pp**: ${pp} pp - ${pc_stars} stars\n**PC pp (if FC)**: ${pline} pp **(${if_fc_acc.toFixed(2)}%)**`)
	} else embed.addField(`**Droid pp (Experimental)**: __${dpp} pp__ - ${droidStars} stars`, `**PC pp**: ${pp} pp - ${pc_stars} stars`);

	message.channel.send({embed: embed}).catch(console.error);
};

module.exports.config = {
	name: "recent",
	description: "Retrieves an droid account's recent play based on uid.",
	usage: "recent <uid>",
	detail: "`uid`: The uid to retrieve [Integer]",
	permission: "None"
};