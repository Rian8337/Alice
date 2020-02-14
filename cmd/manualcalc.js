let Discord = require('discord.js');
let config = require('../config.json');
let osudroid = require('../modules/osu!droid');

module.exports.run = (client, message, args) => {
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
		if (args[i].startsWith("+")) mod = args[i].replace("+", "");
		if (args[i].startsWith("-d")) ndetail = true;
		if (args[i].startsWith("-p")) pcdetail = true
	}
	new osudroid.MapInfo().get({beatmap_id: beatmapid}, mapinfo => {
		if (!mapinfo.title) return message.channel.send("❎ **| I'm sorry, I cannot find the map that you are looking for!**");
		if (!combo) combo = mapinfo.max_combo;
		new osudroid.MapStars().calculate({beatmap_id: beatmapid, mods: mod}, star => {
			let starsline = parseFloat(star.droid_stars.toString().split(" ")[0]);
			let pcstarsline = parseFloat(star.pc_stars.toString().split(" ")[0]);
			let npp = new osudroid.MapPP().calculate({
				stars: star.droid_stars,
				combo: combo,
				miss: missc,
				acc_percent: acc,
				mode: "droid"
			});
			let pcpp = new osudroid.MapPP().calculate({
				stars: star.pc_stars,
				combo: combo,
				miss: missc,
				acc_percent: acc,
				mode: "osu"
			});
			let ppline = parseFloat(npp.pp.toString().split(" ")[0]);
			let pcppline = parseFloat(pcpp.pp.toString().split(" ")[0]);

			let footer = config.avatar_list;
			const index = Math.floor(Math.random() * (footer.length - 1) + 1);
			let embed = new Discord.RichEmbed()
				.setFooter("Alice Synthesis Thirty", footer[index])
				.setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}.jpg`)
				.setColor(mapinfo.statusColor(mapinfo.approved))
				.setAuthor("Map Found", "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg")
				.setTitle(mapinfo.showStatistics(mod, 0))
				.setURL(`https://osu.ppy.sh/b/${mapinfo.beatmap_id}`)
				.addField(mapinfo.showStatistics(mod, 1), mapinfo.showStatistics(mod, 2))
				.addField(mapinfo.showStatistics(mod, 3), `${mapinfo.showStatistics(mod, 4)}\nResult: ${combo}/${mapinfo.max_combo}x / ${acc}% / ${missc} miss(es)`)
				.addField(`Droid pp (Experimental): __${ppline} pp__ - ${starsline} stars`, `PC pp: ${pcppline} pp - ${pcstarsline} stars`);

			if (ndetail) message.channel.send(`Raw droid pp: ${npp.pp.toString()}`);
			if (pcdetail) message.channel.send(`Raw PC pp: ${pcpp.pp.toString()}`);
			message.channel.send({embed: embed}).catch(console.error)
		})
	})
};

module.exports.config = {
	description: "Calculates pp for an osu!standard map.",
	usage: "manualcalc <map link / map ID> [(+<mod>) (<combo>x) (<acc>%) (<miss>m) (-d) (-p)]",
	detail: "`map link/map ID`: The link or beatmap ID of the map [String/Integer]\n`mod`: Applied game modifications (HD, HR, etc) [String]\n`combo`: Max combo reached [Integer]\n`acc`: Accuracy gained [Float]\n`miss`: Amount of misses [Integer]\n`-d`: Gives detailed response of droid pp\n`-p`: Gives detailed response of pp",
	permission: "None"
};

module.exports.help = {
	name: "manualcalc"
};
