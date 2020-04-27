const Discord = require('discord.js');
const osudroid = require('osu-droid');

module.exports.run = (client, message = "", args = {}, maindb) => {
	if (message.channel instanceof Discord.DMChannel || message.author != null) return;
	let trackdb = maindb.collection("tracking");
	trackdb.find({}).toArray(function(err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("Error: Empty database response. Please try again!")
		}
		res.forEach(async function(player) {
			const player_entry = await new osudroid.PlayerInfo().get({uid: player.uid});
			let name = player_entry.name;
			let curtime = Date.now();
			for await (let play of player_entry.recent_plays) {
				let timeDiff = curtime - play.date.getTime() ; //server time is UTC-7, while curtime is in UTC
				if (timeDiff > 600000) break;
				let title = play.title;
				let score = play.score.toLocaleString();
				let ptime = play.date;
				let acc = play.accuracy;
				let mod = play.mods;
				let miss = play.miss;
				let rank = osudroid.rankImage.get(play.rank);
				let combo = play.combo;
				let hash = play.hash;

				let embed = new Discord.MessageEmbed()
					.setAuthor(`Recent play for ${name}`, rank)
					.setTitle(title)
					.setColor(8311585);

				const mapinfo = await new osudroid.MapInfo().get({hash: hash});
				let mod_string = osudroid.mods.pc_to_detail(mod, true);
				if (!mapinfo.title || !mapinfo.objects) {
					embed.setDescription(`**Score**: \`${score}\` - Combo: \`${combo}x\` - Accuracy: \`${acc}%\` (\`${miss}\` x)\nMod: \`${mod_string}\`\nTime: \`${ptime.toUTCString()}\``);
					return client.channels.cache.get("665106609382359041").send({embed: embed})
				}
				let star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: mod});
				let starsline = parseFloat(star.droid_stars.toString().split(" ")[0]);
				let pcstarsline = parseFloat(star.pc_stars.toString().split(" ")[0]);
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
				let ppline = parseFloat(npp.toString().split(" ")[0]);
				let pcppline = parseFloat(pcpp.toString().split(" ")[0]);

				embed.setDescription(`**Score**: \`${score}\` - Combo: \`${combo}x\` - Accuracy: \`${acc}%\`\n(\`${miss}\` x)\nMod: \`${mod_string}\`\nTime: \`${ptime.toUTCString()}\`\n\`${starsline} droid stars - ${pcstarsline} PC stars\`\n\`${ppline} droid pp - ${pcppline} PC pp\``).setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}.jpg`).setURL(`https://osu.ppy.sh/b/${mapinfo.beatmap_id}`);
				client.channels.cache.get("665106609382359041").send(ppline >= 450 ? "<@119496080269377536>" : "", {embed: embed}).catch(console.error)
			}
		})
	})
};

module.exports.config = {
	name: "trackfunc",
	description: "Function for tracking recent plays.",
	usage: "None",
	detail: "None",
	permission: "None"
};
