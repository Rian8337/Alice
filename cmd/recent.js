let config = require('../config.json');
let osudroid = require('../modules/osu!droid');

function rankread(imgsrc) {
	let rank="";
	switch(imgsrc) {
		case 'S':rank="http://ops.dgsrz.com/assets/images/ranking-S-small.png";break;
		case 'A':rank="http://ops.dgsrz.com/assets/images/ranking-A-small.png";break;
		case 'B':rank="http://ops.dgsrz.com/assets/images/ranking-B-small.png";break;
		case 'C':rank="http://ops.dgsrz.com/assets/images/ranking-C-small.png";break;
		case 'D':rank="http://ops.dgsrz.com/assets/images/ranking-D-small.png";break;
		case 'SH':rank="http://ops.dgsrz.com/assets/images/ranking-SH-small.png";break;
		case 'X':rank="http://ops.dgsrz.com/assets/images/ranking-X-small.png";break;
		case 'XH':rank="http://ops.dgsrz.com/assets/images/ranking-XH-small.png";break;
		default: rank="unknown";
	}
	return rank;
}

module.exports.run = (client, message, args) => {
	let uid = parseInt(args[0]);
	if (isNaN(uid)) return message.channel.send("❎ **| Hey, can you at least give me a valid uid?**");
	new osudroid.PlayerInfo().get({uid: uid}, player => {
		if (!player.name) return message.channel.send("❎ **| I'm sorry, I cannot find the player!**");
		if (!player.recent_plays) return message.channel.send("❎ **| I'm sorry, this player hasn't submitted any play!**");
		let rplay = player.recent_plays[0];
		let score = rplay.score.toLocaleString();
		let name = player.name;
		let title = rplay.filename;
		let rank = rankread(rplay.mark);
		let combo = rplay.combo;
		let ptime = new Date(rplay.date * 1000);
		ptime.setUTCHours(ptime.getUTCHours() + 7);
		let acc = parseFloat((rplay.accuracy / 1000).toFixed(2));
		let miss = rplay.miss;
		let mod = rplay.mode;
		let hash = rplay.hash;
		let footer = config.avatar_list;
		const index = Math.floor(Math.random() * (footer.length - 1) + 1);
		let embed = {
			"title": title,
			"description": "**Score**: `" + score + "` - Combo: `" + combo + "x` - Accuracy: `" + acc + "%`\n(`" + miss + "` x)\nMod: `" + new osudroid.MapInfo().modConvert(mod, true) + "`\nTime: `" + ptime.toUTCString() + "`",
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
		new osudroid.MapInfo().get({hash: hash}, mapinfo => {
			if (!mapinfo.title) return;
			let beatmapid = mapinfo.beatmap_id;
			mod = mapinfo.modConvert(mod);
			new osudroid.MapStars().calculate({beatmap_id: beatmapid, mods: mod}, star => {
				let starsline = parseFloat(star.droid_stars.toString().split(" ")[0]);
				let pcstarsline = parseFloat(star.pc_stars.toString().split(" ")[0]);
				let npp = new osudroid.MapPP().calculate({
					stars: star.droid_stars,
					combo: combo,
					miss: miss,
					acc_percent: acc,
					mode: "droid"
				});
				let pcpp = new osudroid.MapPP().calculate({
					stars: star.pc_stars,
					combo: combo,
					miss: miss,
					acc_percent: acc,
					mode: "osu"
				});
				let ppline = parseFloat(npp.pp.toString().split(" ")[0]);
				let pcppline = parseFloat(pcpp.pp.toString().split(" ")[0]);
				embed = new Discord.RichEmbed()
					.setFooter("Alice Synthesis Thirty", footer[index])
					.setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}.jpg`)
					.setColor(mapinfo.statusColor(mapinfo.approved))
					.setAuthor("Map Found", "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg")
					.setTitle(mapinfo.showStatistics(mod, 0))
					.setURL(`https://osu.ppy.sh/b/${mapinfo.beatmap_id}`)
					.addField(mapinfo.showStatistics(mod, 1), mapinfo.showStatistics(mod, 2))
					.addField(mapinfo.showStatistics(mod, 3), mapinfo.showStatistics(mod, 4))
					.addField(`Droid pp (Experimental): __${ppline} pp__ - ${starsline} stars`, `PC pp: ${pcppline} pp - ${pcstarsline} stars`);

				message.channel.send({embed: embed}).catch(console.error)
			})
		})
	})
};

module.exports.config = {
	description: "Retrieves an osu!droid account's recent play based on uid.",
	usage: "recent <uid>",
	detail: "`uid`: The uid to retrieve [Integer]",
	permission: "None"
};

module.exports.help = {
	name: "recent"
};
