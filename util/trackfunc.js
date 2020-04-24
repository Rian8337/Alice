const Discord = require('discord.js');
const osudroid = require('../modules/osu!droid');

module.exports.run = (client, message = "", args = {}, maindb) => {
	if (message.channel instanceof Discord.DMChannel || message.author != null) return;
	let trackdb = maindb.collection("tracking");
	trackdb.find({}).toArray(function(err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("Error: Empty database response. Please try again!")
		}
		res.forEach(async function(player) {
			const player_entry = await new osudroid.PlayerInfo().get({uid: player.uid}).catch(console.error);
			let name = player_entry.name;
			let curtime = Math.floor(Date.now() / 1000);
			for await (let play of player_entry.recent_plays) {
				let timeDiff = curtime - (play.date + 3600 * 6); //server time is UTC-7, while curtime is in UTC
				if (timeDiff > 600) break;
				let title = play.filename;
				let score = play.score.toLocaleString();
				let ptime = new Date(play.date * 1000);
				ptime.setUTCHours(ptime.getUTCHours() + 6);
				let acc = parseFloat((parseFloat(play.accuracy) / 1000).toFixed(2));
				let mod = play.mode;
				let miss = play.miss;
				let rank = osudroid.rankImage.get(play.mark);
				let combo = play.combo;
				let hash = play.hash;

				let embed = new Discord.MessageEmbed()
					.setAuthor(`Recent play for ${name}`, rank)
					.setTitle(title)
					.setColor(8311585);

				const mapinfo = await new osudroid.MapInfo().get({hash: hash}).catch(console.error);
				let mod_string = osudroid.mods.droid_to_PC(mod, true);
				if (!mapinfo.title || !mapinfo.objects) {
					embed.setDescription(`**Score**: \`${score}\` - Combo: \`${combo}x\` - Accuracy: \`${acc}%\` (\`${miss}\` x)\nMod: \`${mod_string}\`\nTime: \`${ptime.toUTCString()}\``);
					return client.channels.cache.get("665106609382359041").send({embed: embed})
				}
				let mods = osudroid.mods.droid_to_PC(mod);
				let star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: mods});
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