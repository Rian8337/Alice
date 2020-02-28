const Discord = require('discord.js');
const config = require('../config.json');
const osudroid = require('../modules/osu!droid');

module.exports.run = (client, message, args, maindb, alicedb, current_map) => {
	let beatmapid;
	let combo;
	let acc = 100;
	let missc = 0;
	let mod = '';
	let ndetail = false;
	let pcdetail = false;
	if (!args[0]) return message.channel.send("❎ **| Hey, how am I supposed to calculate when I don't know what to calculate?**");
	let a = args[0].split("/");
	beatmapid = a[a.length-1];
	for (let i = 1; i < args.length; i++) {
		if (args[i].endsWith("%")) acc = parseFloat(args[i]);
		if (args[i].endsWith("m")) missc = parseInt(args[i]);
		if (args[i].endsWith("x")) combo = parseInt(args[i]);
		if (args[i].startsWith("+")) mod = args[i].replace("+", "").toUpperCase();
		if (args[i].startsWith("-d")) ndetail = true;
		if (args[i].startsWith("-p")) pcdetail = true
	}
	new osudroid.MapInfo().get({beatmap_id: beatmapid}, mapinfo => {
		if (!mapinfo.title) return message.channel.send("❎ **| I'm sorry, I cannot find the map that you are looking for!**");
		if (!mapinfo.objects) return message.channel.send("❎ **| I'm sorry, it seems like the map has 0 objects!**");
		if (!combo) combo = mapinfo.max_combo;
		let max_score = mapinfo.max_score(mod);
		let star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: mod});
		let starsline = parseFloat(star.droid_stars.toString().split(" ")[0]);
		let pcstarsline = parseFloat(star.pc_stars.toString().split(" ")[0]);
		let npp = osudroid.ppv2({
			stars: star.droid_stars,
			combo: combo,
			miss: missc,
			acc_percent: acc,
			mode: "droid"
		});
		let pcpp = osudroid.ppv2({
			stars: star.pc_stars,
			combo: combo,
			miss: missc,
			acc_percent: acc,
			mode: "osu"
		});
		let ppline = parseFloat(npp.toString().split(" ")[0]);
		let pcppline = parseFloat(pcpp.toString().split(" ")[0]);

		let footer = config.avatar_list;
		const index = Math.floor(Math.random() * (footer.length - 1) + 1);
		let embed = new Discord.RichEmbed()
			.setFooter("Alice Synthesis Thirty", footer[index])
			.setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}.jpg`)
			.setColor(mapinfo.statusColor(mapinfo.approved))
			.setAuthor("Map Found", "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg")
			.setTitle(mapinfo.showStatistics(mod, 0))
			.setDescription(mapinfo.showStatistics(mod, 1))
			.setURL(`https://osu.ppy.sh/b/${mapinfo.beatmap_id}`)
			.addField(mapinfo.showStatistics(mod, 2), `${mapinfo.showStatistics(mod, 3)}\n**Max score**: ${max_score.toLocaleString()}`)
			.addField(mapinfo.showStatistics(mod, 4), `${mapinfo.showStatistics(mod, 5)}\n**Result**: ${combo}/${mapinfo.max_combo}x / ${acc}% / ${missc} miss(es)`)
			.addField(`**Droid pp (Experimental)**: __${ppline} pp__ - ${starsline} stars`, `**PC pp**: ${pcppline} pp - ${pcstarsline} stars`);

		if (ndetail) message.channel.send(`Raw droid pp: ${npp.toString()}`);
		if (pcdetail) message.channel.send(`Raw PC pp: ${pcpp.toString()}`);
		message.channel.send({embed: embed}).catch(console.error);

		let time = Date.now();
		let entry = [time, message.channel.id, mapinfo.hash];
		let found = false;
		for (let i = 0; i < current_map.length; i++) {
			if (current_map[i][1] != message.channel.id) continue;
			current_map[i] = entry;
			found = true;
			break
		}
		if (!found) current_map.push(entry)
	})
};

module.exports.config = {
	name: "manualcalc",
	description: "Calculates pp for an osu!standard map.",
	usage: "manualcalc <map link / map ID> [(+<mod>) (<combo>x) (<acc>%) (<miss>m) (-d) (-p)]",
	detail: "`map link/map ID`: The link or beatmap ID of the map [String/Integer]\n`mod`: Applied game modifications (HD, HR, etc) [String]\n`combo`: Max combo reached [Integer]\n`acc`: Accuracy gained [Float]\n`miss`: Amount of misses [Integer]\n`-d`: Gives detailed response of droid pp\n`-p`: Gives detailed response of pp",
	permission: "None"
};
