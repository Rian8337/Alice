const Discord = require('discord.js');
const osudroid = require('osu-droid');
const config = require('../config.json');

function rankEmote(input) {
	if (!input) return;
	switch (input) {
		case 'A': return '611559473236148265';
		case 'B': return '611559473169039413';
		case 'C': return '611559473328422942';
		case 'D': return '611559473122639884';
		case 'S': return '611559473294606336';
		case 'X': return '611559473492000769';
		case 'SH': return '611559473361846274';
		case 'XH': return '611559473479155713';
		default : return;
	}
}

module.exports.run = (client, maindb) => {
	let trackdb = maindb.collection("tracking");
	trackdb.find({}).toArray(function(err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("Error: Empty database response. Please try again!")
		}
		const footer = config.avatar_list;
        const index = Math.floor(Math.random() * footer.length);
		res.forEach(async function(player) {
			const player_entry = await osudroid.Player.getInformation({uid: player.uid});
			const name = player_entry.username;
			const curtime = Date.now();
			for await (const play of player_entry.recentPlays) {
				let timeDiff = curtime - play.date.getTime();
				if (timeDiff > 600000) break;
				let title = play.title;
				const score = play.score.toLocaleString();
				const ptime = play.date;
				const acc = play.accuracy;
				const mod = play.mods;
				const miss = play.miss;
				const rank = client.emojis.cache.get(rankEmote(play.rank));
				const combo = play.combo;
				const hash = play.hash;

				const embed = new Discord.MessageEmbed()
					.setAuthor(`${title} +${mod ? mod : "No Mod"}`, player_entry.avatarURL)
					.setColor(8311585)
					.setFooter(`Achieved on ${ptime.toUTCString()} | Alice Synthesis Thirty`, footer[index]);

				const mapinfo = await osudroid.MapInfo.getInformation({hash: hash});
				if (mapinfo.error || !mapinfo.title || !mapinfo.objects) {
					embed.setDescription(`▸ ${rank} ▸ ${acc}%\n▸ ${score} ▸ ${combo}x ▸ ${miss} miss(es)`);
					return client.channels.cache.get("665106609382359041").send(`✅ **| Most recent play for ${name}:**`, {embed: embed})
				}
				const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mod});
				const starsline = parseFloat(star.droidStars.total.toFixed(2));
				const pcstarsline = parseFloat(star.pcStars.total.toFixed(2));

				title = `${mapinfo.fullTitle} +${mod ? mod : "No Mod"} [${starsline}★ | ${pcstarsline}★]`;
				embed.setAuthor(title, player_entry.avatarURL, `https://osu.ppy.sh/b/${mapinfo.beatmapID}`)
					.setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapsetID}l.jpg`)
					.setImage(`https://assets.ppy.sh/beatmaps/${mapinfo.beatmapsetID}/covers/cover.jpg`);

				const npp = new osudroid.PerformanceCalculator().calculate({
					stars: star.droidStars,
					combo: combo,
					accPercent: acc,
					miss: miss,
					mode: osudroid.modes.droid
				});

				const pcpp = new osudroid.PerformanceCalculator().calculate({
					stars: star.pcStars,
					combo: combo,
					accPercent: acc,
					miss: miss,
					mode: osudroid.modes.osu
				});

				const ppline = parseFloat(npp.total.toFixed(2));
				const pcppline = parseFloat(pcpp.total.toFixed(2));

				if (miss > 0 || combo < mapinfo.maxCombo) {
					const fc_acc = new osudroid.Accuracy({
						n300: npp.computedAccuracy.n300 + miss,
						n100: npp.computedAccuracy.n100,
						n50 : npp.computedAccuracy.n50,
						nmiss: 0,
						nobjects: mapinfo.objects
					}).value() * 100;
		
					const fc_dpp = new osudroid.PerformanceCalculator().calculate({
						stars: star.droidStars,
						combo: mapinfo.maxCombo,
						accPercent: fc_acc,
						miss: 0,
						mode: osudroid.modes.droid
					});
		
					const fc_pp = new osudroid.PerformanceCalculator().calculate({
						stars: star.pcStars,
						combo: mapinfo.maxCombo,
						accPercent: fc_acc,
						miss: 0,
						mode: osudroid.modes.osu
					});
		
					const dline = parseFloat(fc_dpp.total.toFixed(2));
					const pline = parseFloat(fc_pp.total.toFixed(2));
		
					embed.setDescription(`▸ ${rank} ▸ **${ppline}DPP** | **${pcppline}PP** (${dline}DPP, ${pline}PP for ${fc_acc.toFixed(2)}% FC) ▸ ${acc}%\n▸ ${score} ▸ ${combo}x/${mapinfo.maxCombo}x ▸ ${miss} miss(es)`);
				} else embed.setDescription(`▸ ${rank} ▸ **${ppline}DPP** | **${pcppline}PP** ▸ ${acc}%\n▸ ${score} ▸ ${combo}x/${mapinfo.maxCombo}x ▸ ${miss} miss(es)`);

				client.channels.cache.get("665106609382359041").send(`✅ **| Most recent play for ${name}:**\n${ppline >= 450 ? "<@119496080269377536>" : ""}`, {embed: embed}).catch(console.error);
			}
		});
	});
};

module.exports.config = {
	name: "trackfunc",
	description: "Function for tracking recent plays.",
	usage: "None",
	detail: "None",
	permission: "None"
};
