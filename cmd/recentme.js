let Discord = require('discord.js');
let osudroid = require('../modules/osu!droid');
let config = require('../config.json');

function rankread(imgsrc) {
	let rank;
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

function modname(mod) {
	let res = '';
	let count = 0;
	if (mod.includes("-")) {res += 'None '; count++}
	if (mod.includes("r")) {res += 'HardRock '; count++}
	if (mod.includes("h")) {res += 'Hidden '; count++}
	if (mod.includes("d")) {res += 'DoubleTime '; count++}
	if (mod.includes("c")) {res += 'NightCore '; count++}
	if (mod.includes("n")) {res += 'NoFail '; count++}
	if (mod.includes("e")) {res += 'Easy '; count++}
	if (mod.includes("t")) {res += 'HalfTime '; count++}
	if (count > 1) return res.trimRight().split(" ").join(", ");
	else return res.trimRight()
}

function mapstatusread(status) {
	switch (status) {
		case -2: return 16711711;
		case -1: return 9442302;
		case 0: return 16312092;
		case 1: return 2483712;
		case 2: return 16741376;
		case 3: return 5301186;
		case 4: return 16711796;
		default: return 0
	}
}

module.exports.run = (client, message, args, maindb) => {
	let ufind = message.author.id;
	if (args[0]) {
		ufind = args[0];
		ufind = ufind.replace('<@!','');
		ufind = ufind.replace('<@','');
		ufind = ufind.replace('>','');
	}
	console.log(ufind);
	let binddb = maindb.collection("userbind");
	let query = { discordid: ufind };
	binddb.find(query).toArray(function(err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("Error: Empty database response. Please try again!")
		}
		if (!res[0]) return message.channel.send("❎ **| I'm sorry, the account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**")
		let uid = res[0].uid;
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
				"description": "**Score**: `" + score + "` - Combo: `" + combo + "x` - Accuracy: `" + acc + "%`\n(`" + miss + "` x)\nMod: `" + modname(mod) + "`\nTime: `" + ptime.toUTCString() + "`",
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
						.setColor(mapstatusread(mapinfo.approved))
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
	})
};

module.exports.config = {
	description: "Retrieves a user's most recent play (detailed).",
	usage: "recentme [user]",
	detail: "`user`: The user to retrieve [UserResolvable (mention or user ID)]",
	permission: "None"
};

module.exports.help = {
	name: "recentme"
};
