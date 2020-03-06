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
		res.forEach(function(player) {
			new osudroid.PlayerInfo().get({uid: player.uid}, player => {
				let name = player.name;
				let play = player.recent_plays;
				let curtime = Math.floor(Date.now() / 1000);
				for (let i = 0; i < play.length; i++) {
					let timeDiff = curtime - (play[i].date + 3600 * 7); //server time is UTC-7, while curtime is in UTC
					if (timeDiff > 600) break;
					let title = play[i].filename;
					let score = play[i].score.toLocaleString();
					let ptime = new Date(play[i].date * 1000);
					ptime.setUTCHours(ptime.getUTCHours() + 7);
					let acc = parseFloat((parseFloat(play[i].accuracy) / 1000).toFixed(2));
					let mod = play[i].mode;
					let miss = play[i].miss;
					let rank = osudroid.rankImage.get(play[i].mark);
					let combo = play[i].combo;
					let hash = play[i].hash;

					let embed = new Discord.MessageEmbed()
						.setAuthor(`Recent play for ${name}`, rank)
						.setTitle(title)
						.setColor(8311585);

					new osudroid.MapInfo().get({hash: hash}, mapinfo => {
						let mod_string = osudroid.mods.droid_to_PC(mod, true);
						if (!mapinfo.title || !mapinfo.objects) {
							embed.setDescription(`**Score**: \`${score}\` - Combo: \`${combo}x\` - Accuracy: \`${acc}%\` (\`${miss}\` x)\nMod: \`${mod_string}\`\nTime: \`${ptime.toUTCString()}\``);
							return client.channels.cache.get("665106609382359041").send({embed: embed})
						}
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
					})
				}
			})
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
